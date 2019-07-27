const fs = require('fs')
const frames = require('./ufo')

const nounsArr = fs.readFileSync('nouns.txt', 'utf8').split('\n')

class ufoGame {
  constructor() {
    this.codeword = null
    this.wordDict = null
    this.slots = null
    this.incorrectGuesses = null
    this.lettersLeft = Infinity
    this.guesses = null
    this.gameInterface = null
    this.dictMatches = nounsArr
    this.guess = this.guess.bind(this)
  }

  start() {
    const newWord = nounsArr[
      Math.floor(Math.random() * nounsArr.length)
    ].toUpperCase()
    this.codeword = newWord
    this.slots = new Array(newWord.length).fill('_')
    this.incorrectGuesses = []
    this.lettersLeft = newWord.length
    this.guesses = new Set()
    this.wordDict = [...newWord].reduce((acc, ltr, i) => {
      if (acc[ltr]) acc[ltr].push(i)
      else acc[ltr] = [i]
      return acc
    }, {})

    process.stdin.removeAllListeners('data')
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', input => this.guess(input))
    this.play()
  }

  restart(input) {
    input = input.slice(0, input.length - 1).toUpperCase()
    if (input === 'Y') {
      this.start()
    } else if (input === 'N') {
      process.stdout.write(`Thanks for playing. Goodbye!\n`)
      process.exit()
    } else {
      process.stdout.write(
        `That was not a valid response. Would you like to play again (Y/N)? `
      )
    }
  }

  play(result) {
    const isWinner = this.lettersLeft === 0
    const isLoser = this.incorrectGuesses.length === frames.length - 1

    if (isWinner || isLoser) {
      process.stdin.removeAllListeners('data')
      process.stdin.on('data', input => this.restart(input))
      const endCopy = isWinner
        ? `\nCorrect! You saved the person and earned a medal of honor!\nThe codeword is: ${
            this.codeword
          }.`
        : `\nOh no! You've failed to save the person from the UFO!\n${
            frames[frames.length - 1]
          }\nThe codeword was: ${this.codeword}.`
      process.stdout.write(
        `${endCopy}\n\n>> Would you like to play again (Y/N)? `
      )
    } else {
      this.makeNewInterface(result)
      process.stdout.write(
        `${this.gameInterface}\n\n>> Please enter your guess: `
      )
    }
  }

  guess(input) {
    input = input.toUpperCase().slice(0, input.length - 1)
    const alpha = /[a-z]/gi
    const isValid = input.length === 1 && alpha.test(input)

    if (isValid && !this.guesses.has(input)) {
      this.guesses.add(input)
      if (this.wordDict[input]) {
        this.wordDict[input].forEach(i => {
          this.slots[i] = input
          this.lettersLeft--
        })
        this.dictMatches = this.dictMatches.filter(word => {
          return this.wordDict[input].every(i => word[i] === input.toLowerCase())
        })
        this.play('correct')
      } else {
        this.incorrectGuesses.push(input)
        this.dictMatches = this.dictMatches.filter(word => !word.includes(input.toLowerCase()))
        this.play('incorrect')
      }
    } else if (isValid && this.guesses.has(input)) {
      this.play('duplicate')
    } else {
      this.play('invalid')
    }
  }

  makeNewInterface(result) {
    let copy
    switch (result) {
      case 'correct': {
        copy = `Correct! You're closer to cracking the codeword.`
        break
      }
      case 'incorrect': {
        copy = `Incorrect! The tractor beam pulls the person in further.`
        break
      }
      case 'invalid': {
        this.gameInterface =
          '\nI cannot understand your input. Please guess a single letter.'
        return
      }
      case 'duplicate': {
        this.gameInterface =
          '\nYou can only guess that letter once. Please try again.'
        return
      }
      default:
        copy =
          'UFO: The Game\nInstructions: Save us from alien abduction by guessing letters in the codeword.'
    }

    this.gameInterface = `\n${copy}\n\n${
      frames[this.incorrectGuesses.length]
    }\n\nIncorrect Guesses:\n${
      this.incorrectGuesses.length ? this.incorrectGuesses.join(' ') : 'None'
    }\n\nCodeword:\n${this.slots.join(' ')}\n\nNumber of dictionary matches: ${
      this.dictMatches.length
    }`
  }
}

const newGame = new ufoGame()
newGame.start()
