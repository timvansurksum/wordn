import type { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
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

const URL = 'http://localhost:4000'

function LetterBlock({ letter }: { letter: Letter }): JSX.Element {
  return (
    <div className={styles['letter-block']}>
      <div className={styles['letter']}>
        {letter.char}
      </div>
      <div className={`${styles[`letter-shape`]} ${styles[`letter-shape--${letter.state}`]}`}></div>
    </div >
  )
}

function WordRow({ word }: { word: Letter[] }): JSX.Element {
  return <div className={styles['word-row']}>
    {
      word.map((letter, index) => {
        return <LetterBlock key={index} letter={letter} />
      })
    }
  </div>
}

const Application: NextPage = () => {
  /** variables */
  const [token, setToken] = useState<string>('');
  const [validations, setValidation] = useState([]);
  const [tries, setTries] = useState(0);
  const [word, setWord] = useState<Letter[]>([
    getEmptyLetter()
  ]);

  function getEmptyLetter(): Letter {
    return {
      char: '',
      state: LetterState.Empty
    }
  }

  /** set token */
  useEffect(() => {
    console.log('set token')

    /** start for user */
    axios.get(`${URL}/start?length=5&category=standard`).then((response) => {
      setToken(response.data)
    })

    /** set standard word length */
    setWord([
      getEmptyLetter(),
      getEmptyLetter(),
      getEmptyLetter(),
      getEmptyLetter(),
      getEmptyLetter(),
    ])
  }, [])

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

  /** check validations */
  useEffect(() => {
    console.log('validations veranderd')
    console.log(validations)
    if (validations.length == 0) return
    const newWord: Letter[] = []
    Object.entries(validations).forEach(([key, value], _) => {
      newWord.push({
        char: key[0],
        state: translateServerStateToFrontendState(value),
      })
    })
    setWord(newWord)
  }, [validations])


  /** handle all key presses */
  useEffect(() => {
    const alphabet = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'r', 'z'])

    function fillEmptyLetter(key: string) {
      const emptyLetterIndex = word.findIndex((letter) => {
        return letter.state == LetterState.Empty
      })

      if (emptyLetterIndex == -1) {
        console.log('word has been filled')
        return
      }

      let wordCopy = [...word]
      wordCopy[emptyLetterIndex].char = key
      wordCopy[emptyLetterIndex].state = LetterState.Filled
      setWord(wordCopy);
    }

    function getStringFromWord() {
      return word.map((letter) => letter.char).join('')
    }

    async function validateWord() {
      // const chars = word.map((letter) => letter.char).join('')
      // const charWithDot = word.map((letter) => letter.char).map(char => `${char}. `).join('')
      // let utterance = new SpeechSynthesisUtterance(`${chars}! ${charWithDot}`);
      // utterance.voice = speechSynthesis.getVoices()[1]
      // speechSynthesis.speak(utterance);
      const emptyLetter = word.find(letter => letter.state == LetterState.Empty)
      /** cannot send word  */
      if (emptyLetter) {
        console.log('iets')
      }

      /** can send word */
      else {
        try {
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
    }

    function handleKeyPress(key: string) {
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
    window.addEventListener('keypress', handleEvent);
    return () => {
      window.removeEventListener('keypress', handleEvent)
    }
  }, [token, word]);

  return (
    <div className={styles['container']}>
      <header>
        <h1 className={styles['title']}>Wordn</h1>
      </header>
      <main>
        <WordRow word={word} />
      </main>
    </div>
  )
}

export default Application
