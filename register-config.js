function registerAcceptance(data, user){
    let check = {
        message: ' ',
        status: true}
    if(data.some(x => x.userName === user.userName)){
        check.message = 'User already exist'
        check.status = false
    }
    else if(data.some(x => x.email === user.email)){
        check.message = 'email already exist'
        check.status = false
    }
    return check
}

module.exports = registerAcceptance