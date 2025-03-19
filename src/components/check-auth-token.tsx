"use client"

interface CheckAreaAuthProps {
  areaId: string
  onTokenFound: (token: string) => void
  onNoToken: () => void
}

export default function CheckAreaAuth({ areaId, onTokenFound, onNoToken }: CheckAreaAuthProps) {
  const checkForToken = () => {
    const storedToken = localStorage.getItem(`auth_token_${areaId}`)

    if (storedToken) {
      onTokenFound(storedToken)
    } else {
      onNoToken()
    }
  }

  return { checkForToken }
}

