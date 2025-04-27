import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { ChatWindow } from '../Chat';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
      <ChatWindow />
    </div>
  );
};

export default Layout;
