import { ReactNode, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import './SplitLayout.css';

// Lazy load ChatWindow
const ChatWindow = lazy(() => import('../Chat/ChatWindow'));

interface SplitLayoutProps {
  children: ReactNode;
}

const SplitLayout = ({ children }: SplitLayoutProps) => {
  return (
    <div className="layout split-layout">
      <Header />
      <div className="split-content">
        <motion.div
          className="chat-section"
          initial={{ width: '0%', opacity: 0 }}
          animate={{ width: '33%', opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="chat-section-inner">
            <h2>Chat with Witty</h2>
            <p>I'm here to help you navigate through the portfolio and answer any questions you might have!</p>
            <div className="chat-section-window">
              <Suspense fallback={<div className="chat-loading">Loading chat...</div>}>
                <ChatWindow expanded={true} />
              </Suspense>
            </div>
          </div>
        </motion.div>

        <motion.main
          className="main-content"
          initial={{ width: '100%' }}
          animate={{ width: '67%' }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </div>
      <Footer />
    </div>
  );
};

export default SplitLayout;
