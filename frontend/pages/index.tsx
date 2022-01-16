import type { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

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

function LetterBlock({ letter }: { letter: Letter }): JSX.Element {
  useEffect(() => {
    console.log('letter changed')
    console.log(letter)
  }, [letter])

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
  const alphabet = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'r', 'z'])
  // const [word, setWord] = useState<Letter[]>([
  //   getEmptyLetter(),
  //   getEmptyLetter(),
  //   getEmptyLetter(),
  //   getEmptyLetter(),
  //   getEmptyLetter(),
  // ]);

  const [word, setWord] = useState<Letter[]>([
    { ...getEmptyLetter(), ...{ char: 'a', state: LetterState.Correct } },
    { ...getEmptyLetter(), ...{ char: 'b', state: LetterState.Incorrect } },
    { ...getEmptyLetter(), ...{ char: 'c', state: LetterState.IncorrectPosition } },
    getEmptyLetter(),
    getEmptyLetter(),
    getEmptyLetter(),
    getEmptyLetter(),
  ]);

  function getEmptyLetter(): Letter {
    return {
      char: '',
      state: LetterState.Empty
    }
  }

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


  function validateWord() {
    // const chars = word.map((letter) => letter.char).join('')
    // const charWithDot = word.map((letter) => letter.char).map(char => `${char}. `).join('')
    // let utterance = new SpeechSynthesisUtterance(`${chars}! ${charWithDot}`);
    // utterance.voice = speechSynthesis.getVoices()[1]
    // speechSynthesis.speak(utterance);
  }

  function handleKeyPress(key: string) {
    console.log(key)
    /** submit word */
    if (key == 'Enter') {
      validateWord()
    }
    /** fill letter */
    if (alphabet.has(key)) {
      fillEmptyLetter(key)
    }
  }


  /** handle all key presses */
  useEffect(() => {
    const handleEvent = ({ key }: { key: string }) => handleKeyPress(key)
    const eventListener = window.addEventListener('keypress', handleEvent);
    return () => {
      window.removeEventListener('keypress', handleEvent)
    }
  }, []);

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
