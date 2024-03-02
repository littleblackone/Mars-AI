'use client'

import { useEffect, useState } from 'react';
import { login, signup } from './actions'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { LoaderIcon } from "lucide-react";
import { createClient } from '@/lib/supabase/client'



export default function LoginPage() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isConfirmPasswordWrong, setIsConfirmPasswordWrong] = useState(false)

  const [showSignUp, setShowSignUp] = useState(false)
  const [showEmailInput, setShowEmailInput] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (password.length > 0 && confirmPassword.length > 0) {
      if (password !== confirmPassword) {
        setIsConfirmPasswordWrong(true)
      } else {
        setIsConfirmPasswordWrong(false)
      }
    }
  }, [password, confirmPassword])


  const handleLoginAndSignUp = async () => {
    if (showSignUp) {
      if (isConfirmPasswordWrong) return;
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      setIsLoading(true)
      await signup(formData)
      setIsLoading(false)
    } else {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      setIsLoading(true)
      await login(formData)
      setIsLoading(false)
    }
  };



  const handleResetPassword = async () => {
    // Handle reset password logic here
    if (email === '') return
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    console.log(data, error);

  };

  return (
    <div className=" w-screen h-screen flex-center">
      {!showEmailInput ?
        <div className="flex p-4 px-16 shadow-md flex-col items-center justify-center gap-2 w-[30rem] h-fit">
          <div className="flex gap-2 items-center">
            <img src="/logo.png" alt="logo" width={60} height={60} />
            <span className="text-xl font-bold">Infinity AI</span>
          </div>
          <div className=" w-full">
            <div className="flex w-full flex-col gap-4">
              <Label className="text-neutral-800 text-nowrap text-sm">
                Email:
              </Label>
              <Input
                value={email}
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full focus-visible:ring-transparent focus-visible:ring-offset-transparent"
              />
            </div>
          </div>
          <div className=" w-full">
            <div className="flex flex-col gap-2">
              <Label className="text-neutral-800 text-nowrap text-sm">
                Password:
              </Label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                minLength={6}
                placeholder="Password"
                className="w-full focus-visible:ring-transparent focus-visible:ring-offset-transparent"
              />
            </div>
          </div>
          {showSignUp &&
            <>
              <div className=" w-full">
                <div className="flex flex-col gap-2">
                  <Label className="text-neutral-800 text-nowrap text-sm">
                    confirm Password:
                  </Label>
                  <Input
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value) }}
                    type="password"
                    minLength={6}
                    placeholder="confirmPassword"
                    className="w-full focus-visible:ring-transparent focus-visible:ring-offset-transparent"
                  />
                  {isConfirmPasswordWrong && <p className="text-sm text-red-500">Passwords must match</p>}
                </div>
              </div>
            </>
          }
          <a href="#" onClick={() => {
            setShowEmailInput(true)
          }} className="my-2 self-end text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
          <Button type='button' onClick={() => handleLoginAndSignUp()} className="w-full flex items-center gap-1">
            {showSignUp ? 'Sign up' : 'Sign in'}
            {isLoading && <LoaderIcon width={15} height={15} className=" animate-spin"></LoaderIcon>}
          </Button>
          <p className={`${showSignUp && 'hidden'} mt-2  text-sm font-light text-gray-500 dark:text-gray-400`}>
            Don’t have an account yet? <a href="#" onClick={() => setShowSignUp(true)} className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</a>
          </p>
          <p className={`hidden ${showSignUp && '!block'} mt-2  text-sm font-light text-gray-500 dark:text-gray-400`}>
            Already have an account? <a href="#" onClick={() => setShowSignUp(false)} className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign in</a>
          </p>
        </div>
        :
        <div className="flex p-4 px-16 shadow-md flex-col items-center justify-center gap-2 w-[30rem] h-fit">
          <div className="flex gap-2 items-center">
            <img src="/logo.png" alt="logo" width={60} height={60} />
            <span className="text-xl font-bold">Infinity AI</span>
          </div>
          <div className=" w-full">
            <div className="flex w-full flex-col gap-4">
              <Label className="text-neutral-800 text-nowrap text-sm">
                Email:
              </Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                className="w-full focus-visible:ring-transparent focus-visible:ring-offset-transparent"
              />
            </div>
          </div>
          <Button type='button' onClick={() => handleResetPassword()} className="mt-2 w-full flex gap-2 items-center">
            Send email
            {isLoading && <LoaderIcon width={15} height={15} className=" animate-spin"></LoaderIcon>}
          </Button>
          <a href="#" onClick={() => setShowEmailInput(false)} className="mt-2 text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Cancel</a>
        </div>
      }
    </div >
  );
}

