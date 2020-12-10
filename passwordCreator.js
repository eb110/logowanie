function createPassword(){
  let letters = [...'abcdefghijklmnopqrstuvwxyz']
  let numbers = [...'0123456789']
  let characters = [...'!@#$%^&*()_+']
  let zbiornik = []
  for(let i = 0; i < 4; i++){
      let wsad = letters[Math.floor(Math.random() * 26)]
      zbiornik.push(wsad)
      wsad = letters[Math.floor(Math.random() * 26)].toUpperCase()
      zbiornik.push(wsad)
      wsad = numbers[Math.floor(Math.random() * 10)]
      zbiornik.push(wsad)
      wsad = characters[Math.floor(Math.random() * 12)]
      zbiornik.push(wsad)
  }
  return zbiornik.reduce((acc, n) => acc + n, '')
}

module.exports = createPassword