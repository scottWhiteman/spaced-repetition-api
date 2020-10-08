const LinkedList = require('./LinkedList')

const LanguageService = {
  WordList: new LinkedList(),
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

  // There may be several issues with some of these. 
  updateHead(db, word_id, head) {
    return db
      .from('word')
      .where('id', word_id)
      .update(head)
      .then(rows => {})
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

  populateLinkedList(words) {
    this.WordList.head = null;
    for(let i=0; i<words.length; i++){
      this.WordList.insertLast(words[i].id)
    }
    console.log(this.WordList.display());
    this.current = this.WordList.head;
    return this.WordList
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
  }
}

module.exports = LanguageService
