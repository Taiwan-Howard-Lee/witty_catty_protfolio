import { ReactNode, lazy, Suspense } from 'react';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

// Lazy load ChatWindow
const ChatWindow = lazy(() => import('../Chat/ChatWindow'));

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
      <Suspense fallback={<div className="chat-loading">Loading chat...</div>}>
        <ChatWindow />
      </Suspense>
    </div>
  );
};

export default Layout;
