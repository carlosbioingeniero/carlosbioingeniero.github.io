const NUMBER_2 = 2
const queryParams = function (queryString) {
  const decode = function (s) {
    return decodeURIComponent(s.replace(/\+/g, ' '))
  }

  const search = /([^&=]+)=?([^&]*)/g

  const queryParam = {}
  let match = search.exec(queryString)
  while (match) {
    queryParam[decode(match[1])] = decode(match[NUMBER_2])
    match = search.exec(queryString)
  }

  return queryParam
}

module.exports = queryParams
