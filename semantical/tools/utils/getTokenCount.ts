// Get token count of a text string

//Right now we're just ballparking it by counting the number of words

// This could be updated to be more accurate, although slower

const getTokenCount = async (text: string) => {
  // Split the text into an array of words
  const words = text.split(' ')

  // Return the length of the array
  return words.length
}

export default getTokenCount
