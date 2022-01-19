import type { NextPage } from 'next';
import { createRef, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.css';
import axios from 'axios';
import { findSourceMap } from 'module';

enum LetterState {
  Empty = 'empty',
  Filled = 'filled',
  Correct = 'correct',
  Incorrect = 'incorrect',
  IncorrectPosition = 'incorrect-position',
}

type Letter = {
  char: string,
  state: LetterState
}

console.log(`node env: ${process.env.NODE_ENV}`)
const env = process.env.NODE_ENV
const URL = (env == "development")
  ? 'http://localhost:4000'
  : 'https://backend.wordn.nl'


function LetterBlock({ letter }: { letter: Letter }): JSX.Element {
  return (
    <div className={`${styles['letter-block']} ${styles[`letter-block--${letter.state}`]}`}>
      <div className={styles['letter']}>
        {letter.char}
      </div>
      <div className={`${styles[`letter-shape`]} ${styles[`letter-shape--${letter.state}`]}`}></div>
    </div >
  )
}

function WordRow({ word, incorrectWord }: { word: Letter[], incorrectWord: boolean }): JSX.Element {
  return <div className={styles['word-row']} data-incorrect={incorrectWord}>
    {
      word.map((letter, index) => {
        return <LetterBlock key={index} letter={letter} />
      })
    }
  </div>
}

const Application: NextPage = () => {
  /**
   * APPLICATION STATE
   */
  const [incorrectWord, setIncorrectWord] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const [validations, setValidation] = useState([]);
  const [tries, setTries] = useState(0);
  const [oldWords, setOldWords] = useState<Array<Letter[]>>([]);
  const [word, setWord] = useState<Letter[]>([]);

  function resetGame() {
    setIncorrectWord(false)
    setFinished(false)
    setTries(0)
    setOldWords([])
    startNewGame(setToken, setWord);
  }

  /**
   * START GAME ON LOAD
   */
  useEffect(() => {
    startNewGame(setToken, setWord);
  }, [])

  /** 
   * UPDATE TO VALIDATIONS
   * check whether we have to update word state
   **/
  useEffect(() => {

    // check if user is finished
    if (word.length == 0) return

    // check if user has filled anything
    const startState = word[0].state == LetterState.Empty
    if (startState) return

    // check if server returned that we have a invalid word
    const invalidWord = Object.entries(validations).length == 0
    if (invalidWord) {
      setWord(getEmptyWord())
      setIncorrectWord(true)
      return
    }

    // update word with validation
    const newWord: Letter[] = []
    updateWordWithValidations(validations, newWord);

    // give the user a new try
    const newOldWords = [...oldWords, newWord]
    setOldWords(newOldWords)
    setIncorrectWord(false)

    // check if word is correct
    const wordCorrect = isWordCorrect(validations)
    if (wordCorrect) {
      setWord([])
      setFinished(true)
    } else {
      /** new try */
      setWord(getEmptyWord())
    }

    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 200)
  }, [validations])


  /** 
   * ADD KEY HANDLERS
   */
  useEffect(() => {
    const alphabet = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'r', 'z'])

    function fillEmptyLetter(key: string) {
      const emptyLetterIndex = word.findIndex((letter) => {
        return letter.state == LetterState.Empty
      })

      if (emptyLetterIndex == -1) {
        console.log('word has been filled')
        return
      }

      let wordToAdjust = [...word]
      wordToAdjust[emptyLetterIndex].char = key
      wordToAdjust[emptyLetterIndex].state = LetterState.Filled
      setWord(wordToAdjust);
    }

    function getStringFromWord(): string {
      return word.map((letter) => letter.char).join('')
    }

    async function validateWord(): Promise<void> {
      const emptyLetter = word.find(letter => letter.state == LetterState.Empty)

      // check if user is finished
      if (finished) {
        resetGame()
        return
      }

      /** cannot send word  */
      if (emptyLetter) return

      try {
        /** say word */
        const chars = word.map((letter) => letter.char).join('')
        const charWithDot = word.map((letter) => letter.char).map(char => `${char}. `).join('')
        let utterance = new SpeechSynthesisUtterance(`${chars}! ${charWithDot}`);
        speechSynthesis.speak(utterance);

        const data = {
          token: token,
          word: getStringFromWord()
        }
        const response = await axios.post(`${URL}/validate_word`, data)
        setToken(response.data.token)
        setValidation(response.data.validation)
        setTries(response.data.tries)
      } catch (error) {
        console.log(error)
      }
    }

    function removeLastLetter(): void {
      /** find the first filled letter at the end */
      let wordToReverse = [...word]
      const filledLetterReverseIndex = wordToReverse.reverse().findIndex(letter => letter.state == LetterState.Filled)
      if (filledLetterReverseIndex == -1) return
      const firstFilledLetterIndex = (word.length - 1) - filledLetterReverseIndex
      let wordToAdjust = [...word]
      wordToAdjust[firstFilledLetterIndex].char = ''
      wordToAdjust[firstFilledLetterIndex].state = LetterState.Empty
      setWord(wordToAdjust)
    }

    function handleKeyPress(key: string) {
      if (key == 'Backspace') {
        removeLastLetter()
      }
      /** submit word */
      if (key == 'Enter') {
        validateWord()
      }
      /** fill letter */
      if (alphabet.has(key)) {
        fillEmptyLetter(key)
      }
    }

    /** set key events */
    const handleEvent = ({ key }: { key: string }) => handleKeyPress(key)
    window.addEventListener('keydown', handleEvent);
    return () => {
      window.removeEventListener('keydown', handleEvent)
    }
  }, [token, word, finished]);

  const textInput = useRef(null);

  function focusTextInput() {
    console.log('focus text')
    // @ts-ignore
    textInput.current.focus()
  }

  return (
    <div className={styles['container']}>
      <input type="text" ref={textInput} className={styles['focus-input']} />
      <button className={styles['focus-button']} onClick={focusTextInput}>test</button>
      <header className={styles['header']}>
        <h1 className={styles['title']}>Wordn</h1>
      </header>
      <main className={styles['word-rows']}>
        {
          oldWords.map((oldWord, index) => {
            return <WordRow word={oldWord} incorrectWord={false} key={index} />
          })
        }
        <WordRow word={word} incorrectWord={incorrectWord} />
      </main>
    </div>
  )
}

function startNewGame(setToken: { (value: SetStateAction<string>): void; (value: SetStateAction<string>): void; (arg0: any): void; }, setWord: { (value: SetStateAction<Letter[]>): void; (value: SetStateAction<Letter[]>): void; (arg0: Letter[]): void; }) {
  axios.get(`${URL}/start?length=5&category=standard`).then((response) => {
    setToken(response.data);
  });

  /** set standard word length */
  setWord(getEmptyWord());
}

function getEmptyLetter(): Letter {
  return {
    char: '',
    state: LetterState.Empty
  }
}

function getEmptyWord(): Letter[] {
  return [
    getEmptyLetter(),
    getEmptyLetter(),
    getEmptyLetter(),
    getEmptyLetter(),
    getEmptyLetter(),
  ]
}

function translateServerStateToFrontendState(serverState: string): LetterState {
  if (serverState == 'WrongPosition') {
    return LetterState.IncorrectPosition
  }
  if (serverState == 'Wrong') {
    return LetterState.Incorrect
  }
  if (serverState == 'Correct') {
    return LetterState.Correct
  }
  throw Error('could not find state')
}

function isWordCorrect(validations: never[]) {
  return Object.entries(validations).every(([key, value]) => translateServerStateToFrontendState(value) == LetterState.Correct);
}

function updateWordWithValidations(validations: never[], newWord: Letter[]) {
  Object.entries(validations).forEach(([key, value], _) => {
    newWord.push({
      char: key[0],
      state: translateServerStateToFrontendState(value),
    });
  });
}

export default Application