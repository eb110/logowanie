function checkPassword(a){
    if(a == null || !isNaN(a))return false
   if(a.length < 8 || a.length > 16) return false
   if(a.includes('<script>'))return false
   if(a.includes('href'))return false
   if(a.includes(' '))return false
   let letters = 'abcdefghijklmnopqrstuvwxyz'
   let numbers = '0123456789'
   let check = 0
   if([...a].some(x => letters.includes(x)))check = 1
   if(check == 0)return false
   if([...a].some(x => letters.toUpperCase().includes(x)))check = 1
   if(check == 0)return false
   if([...a].some(x => numbers.includes(x))) return true
    return  false
}

module.exports = checkPassword