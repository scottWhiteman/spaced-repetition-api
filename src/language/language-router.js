const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const BodyParser = express.json()

const languageRouter = express.Router()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )
      
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      

      const word = await LanguageService.getWordById(
        req.app.get('db'),
        language.head
      )
      res.json({
        nextWord: word.original,
        wordCorrectCount: word.correct_count,
        wordIncorrectCount: word.incorrect_count,
        totalScore: language.total_score
      })
    } catch(error) {
      next(error)
    }
  })

languageRouter
  .post('/guess', BodyParser, async (req, res, next) => {
    try {
      const {guess} = req.body;
      if(!guess) {
        return res.status(400).json({
          error: `Missing 'guess' in request body`
        })
      }
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      const WordList = LanguageService.populateLinkedList(words, language.head)
      let word = WordList.head.value
      let isCorrect;
      
      if(guess !== word.translation) {
        word.incorrect_count++
        word.memory_value = 1
        isCorrect = false;
      } else {
        word.correct_count++
        word.memory_value *= 2
        language.total_score++
        isCorrect = true;
      }
      WordList.remove(word)
      WordList.insertAt(word, word.memory_value+1)
      WordList.updateLinks()
      
      await LanguageService.updateHead(
        req.app.get('db'),
        language.id,
        WordList.head.value.id
      )

      await LanguageService.updateLanguageTotal(
        req.app.get('db'),
        language.id,
        language.total_score
      )
      
      await LanguageService.serialize(req.app.get('db'), WordList)

      const nextWord = WordList.head.value;

      res.status(200).json({
        nextWord: nextWord.original,
        totalScore: language.total_score,
        wordCorrectCount: nextWord.correct_count,
        wordIncorrectCount: nextWord.incorrect_count,
        answer: word.translation,
        isCorrect
      })
    }
    catch(error) {
      next(error)
    }
  })

module.exports = languageRouter
