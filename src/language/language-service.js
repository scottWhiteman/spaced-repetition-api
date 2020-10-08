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

  addIncorrect(db, id, incorrect_count) {
    return db
      .from('word')
      .where({ id })
      .increment(incorrect_count, 1)
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

  moveWord(word) {
    let curr = this.WordList.head
    let prev = this.WordList.head
    let pulledWord
    while (curr && curr.value !== word.id) {
      prev = curr;
      curr = curr.next;
    }
    if (!curr) {
      return
    }
    pulledWord = curr
    prev.next = curr.next
    //InsertWordAt function used here
    this.insertWordAt(word, word.memory_value+1)
  },

  insertWordAt(word, memoryPos) {
    //Word is placed at memoryPos within the linked list
    //Update next values/ids in both linked list and database
    
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