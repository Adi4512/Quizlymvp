

const Footer = () => {
    const year=new Date().getFullYear();


  return (
    <div className="relative bg-gradient-to-r from-purple-300/80 to-purple-600/80 backdrop-blur-lg p-4 overflow-hidden w-full">
      <div className="text-center">
        <p className="font-bold text-white drop-shadow mb-2">Copyright &copy; {year} All rights reserved</p>
        <p className="font-semibold text-purple-100">
          Crafted with 💜 by 
          <a 
            href="https://adisharma.dev" 
            className="text-cyan-300 underline hover:text-purple-200 transition-colors ml-1"
          >
            Aditya
          </a>
        </p>
      </div>
    </div>  
  )
}

export default Footer