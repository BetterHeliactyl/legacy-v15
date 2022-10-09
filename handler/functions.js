function randStr() {
return Math.random().toString(36).slice(2, 19);
}

module.exports = {
  randString:randStr
}
