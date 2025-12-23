import { Menu } from 'lucide-react'
import './Header.css'

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-button" aria-label="Menu">
          <Menu size={20} />
        </button>
        <h1 className="header-title">The U.S. Energy Access Index</h1>
      </div>
      <div className="header-right">
        <span className="header-org">Energy Access Initiative</span>
      </div>
    </header>
  )
}

export default Header

