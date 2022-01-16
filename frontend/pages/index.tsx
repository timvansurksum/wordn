import type { NextPage } from 'next';
import { createRef, useCallback, useEffect, useRef, useState } from 'react';
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

// const URL = 'http://localhost:4000'
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
    /** variables */
    const [incorrectWord, setIncorrectWord] = useState<boolean>(false);
    const [token, setToken] = useState<string>('');
    const [validations, setValidation] = useState([]);
    const [tries, setTries] = useState(0);
    const [oldWords, setOldWords] = useState<Array<Letter[]>>([]);
    const [word, setWord] = useState<Letter[]>([
        getEmptyLetter()
    ]);

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

    /** set token */
    useEffect(() => {
        console.log('set token')

        /** start for user */
        axios.get(`${URL}/start?length=5&category=standard`).then((response) => {
            setToken(response.data)
        })

        /** set standard word length */
        setWord(getEmptyWord())
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
        console.log('etest')
        // console.log(Object.entries(validations))
        // console.log(Object.entries(validations).length)
        if (Object.entries(validations).length == 0) {
            if (word[0].state == LetterState.Empty) return
            setWord(getEmptyWord())
            setIncorrectWord(true)
            return
        }

        const newWord: Letter[] = []
        Object.entries(validations).forEach(([key, value], _) => {
            newWord.push({
                char: key[0],
                state: translateServerStateToFrontendState(value),
            })
        })
        const newOldWords = [...oldWords, newWord]
        const wordCorrect = Object.entries(validations).every(([key, value]) => translateServerStateToFrontendState(value) == LetterState.Correct)
        setOldWords(newOldWords)
        setIncorrectWord(false)
        if (wordCorrect) {
            setWord([])
        } else {
            /** new try */
            setWord(getEmptyWord())
        }

        setTimeout(() => {
            // window.scrollTo(0, document.body.scrollHeight);
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        }, 200)
    }, [validations])


    /** handle all key presses */
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

        function getStringFromWord() {
            return word.map((letter) => letter.char).join('')
        }

        async function validateWord() {
            const emptyLetter = word.find(letter => letter.state == LetterState.Empty)
            /** cannot send word  */
            if (emptyLetter) {
                console.log('iets')
            }

            /** can send word */
            else {
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
        }

        function removeLastLetter() {
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
    }, [token, word]);

    const textInput = useRef(null);

    function focusTextInput() {
        console.log('focus text')
        // @ts-ignore
        textInput.current.focus()
    }

    // useEffect(() => {
    //     // setTimeout(() => {
    //     //     focusTextInput()
    //     // }, 250)
    //     document.addEventListener('click', focusTextInput)
    //     return document.removeEventListener('click', focusTextInput)
    // }, [])

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

export default Application
