import { WebContainerClient } from "@/app/_components/webcontainerClient"

export default function WebContainerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='min-h-screen'>
        {children}
        <div className='flex justify-center'>
          <WebContainerClient/>
        </div>
    </div>
  )
}
