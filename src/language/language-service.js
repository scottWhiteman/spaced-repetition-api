const { serializeUser } = require('../user/user-service')
const LinkedList = require('./LinkedList')

const LanguageService = {
  
  current: null,
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

  updateHead(db, language_id, head_id) {
    return db
      .from('language')
      .update({head: head_id})
      .where({id: language_id})
  },

  updateLanguageTotal(db, language_id, total) {
    return db
      .from('language')
      .where('id', language_id)
      .update('total_score', total)
      .then(rows => {})
  },
  
  getHead(db, language_id) {
    return db
      .from('language')
      .first('head')
      .where('id', language_id)
      .then(res => res.head);
  },

  populateLinkedList(words, head) {
    let WordList = new LinkedList()
    let headWord = words.find(word => word.id === head)
    if(headWord){
      WordList.insertLast(headWord)
    }
    let node = words.find(word => word.id === headWord.next)
    while(node){
      WordList.insertLast(node)
      node = words.find(word => word.id === node.next)
    }
    return WordList
  },

  serialize(db, list) {
    return db.transaction(trx => {
      let words = list.display();
      const queries = [];
      words.forEach(word => {
        const query = db('word')
          .where('id', word.id)
          .update(word)
          .transacting(trx)
        queries.push(query)
      })
      Promise.all(queries)
        .then(trx.commit)
        .catch(trx.rollback)
    })
  },

}

module.exports = LanguageService