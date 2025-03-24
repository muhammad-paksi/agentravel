
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Apple from "next-auth/providers/apple"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, GitHub, Apple],
})
