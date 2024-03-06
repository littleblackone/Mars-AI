
import { ImageForm } from "@/components/shared/ImageForm";
import UserCreditsServer from "@/components/shared/realtime/UserCreditsServer";
import { currentUser } from "@clerk/nextjs";

export default async function Create() {
  const user = await currentUser()
 
  if (!user) return

  return (
    user && (<div className=" relative flex form-shadow  items-start  w-full max-h-screen overflow-hidden bg-white ">
      <ImageForm email={user.emailAddresses[0].emailAddress ?? ''}></ImageForm>
      <div className=" fixed right-[4.3rem] top-[6px]">
        <UserCreditsServer email={user.emailAddresses[0].emailAddress ?? ''}></UserCreditsServer>
      </div>
    </div>)
  )

}
