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

      LanguageService.populateLinkedList(words)

      const word = await LanguageService.getWordById(
        req.app.get('db'),
        LanguageService.current.value
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

//Lots of missteps here. Sorry, it's been a long day.
//There is a lot that we can refactor also.
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
      // const words = await LanguageService.getLanguageWords(
      //   req.app.get('db'),
      //   req.language.id,
      // )
      const word = await LanguageService.getWordById(
        req.app.get('db'),
        LanguageService.current.value
      )
      let nextWord = await LanguageService.getWordById(
        req.app.get('db'),
        LanguageService.current.next ? LanguageService.current.next.value : null
      )
      //I imagine that the linked list should be traversed as the
      //user moves through the questions, and the database should be updated
      //as the user answers the questions. I'm failing to see the benefit
      //of using a linked list class when the structure of the
      //database already follows a linked list pattern. But the instructions
      //are explicit.
      
      let isCorrect = false;
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
      const newHead = {
        correct_count: word.correct_count,
        incorrect_count: word.incorrect_count,
        memory_value: word.memory_value
      }
      LanguageService.updateHead(
        req.app.get('db'),
        LanguageService.current.value,
        newHead
      )
      LanguageService.updateLanguageTotal(
        req.app.get('db'),
        language.id,
        language.total_score
      )
      LanguageService.moveWord(word);
      LanguageService.current = LanguageService.current.next ? LanguageService.current.next : LanguageService.WordList.head;
      if (!nextWord) {
        nextWord = await LanguageService.getWordById(
          req.app.get('db'),
          LanguageService.current.value
        )
      }

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
