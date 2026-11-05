import { GoogleLogin } from "@react-oauth/google"
import { useNavigate } from "react-router"
import { useGoogleLoginMutation } from "../services/api"
import { getErrorMessage } from "../utils/apiError"

function GoogleButton({ onError }: { onError: (message: string) => void }) {
  const navigate = useNavigate()
  const [googleLogin] = useGoogleLoginMutation()

  async function handle(credential?: string) {
    if (!credential) return onError("Google sign-in failed")
    try {
      await googleLogin({ credential }).unwrap()
      navigate("/")
    } catch (err) {
      onError(getErrorMessage(err))
    }
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={(response) => handle(response.credential)}
        onError={() => onError("Google sign-in was cancelled or failed")}
        text="continue_with"
        width="320"
      />
    </div>
  )
}

export default GoogleButton