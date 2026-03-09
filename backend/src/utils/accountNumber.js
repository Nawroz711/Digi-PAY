export const generateAccountNumber = () => {
  const min = 100000000000
  const max = 999999999999
  return String(Math.floor(Math.random() * (max - min + 1)) + min)
}

export const getUniqueAccountNumber = async (existsChecker, maxAttempts = 10) => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const accountNumber = generateAccountNumber()
    const exists = await existsChecker(accountNumber)
    if (!exists) {
      return accountNumber
    }
  }

  throw new Error('Failed to generate a unique account number')
}
