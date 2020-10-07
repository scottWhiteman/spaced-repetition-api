const LinkedList = require('./LinkedList')
let WordList = new LinkedList()

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
  },

  getWordById(db, id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ id })
      .first()
  },

  // There may be several issues with some of these. 
  updateHead(db, language_id, head) {
    return db
      .from('language')
      .where('id', language_id)
      .update({ head });
  },
  
  getHead(db, language_id) {
    return db
      .from('language')
      .first('head')
      .where('id', language_id)
      .then(res => res.head);
  },

  addIncorrect(db, id, incorrect_count) {
    return db
      .from('word')
      .where({ id })
      .increment(incorrect_count, 1)
  },

  populateLinkedList(words) {
    WordList.head = null;
    for(let i=0; i<words.length; i++){
      WordList.insertLast(words[i])
    }
    return WordList
  },



}

module.exports = LanguageService
