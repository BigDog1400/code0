import { WebContainerClient } from '../_components/webcontainerClient'

export default function WebContainerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='min-h-screen'>
        {children}
        {/* Center on the bottom */}
        <div className='flex justify-center'>

        <WebContainerClient 
        
        
        />
        </div>
    </div>
  )
}
