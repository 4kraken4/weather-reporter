import './styles/MessageTemplate.scss';

export type SeverityIcons = {
  success: string;
  info: string;
  warn: string;
  error: string;
  [key: string]: string;
};

export type Message = {
  severity?: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';
  sticky?: boolean;
  closable?: boolean;
  content?: string;
  life?: number;
  summary?: string;
  detail?: string;
};

const messageTemplate = (message: Message) => {
  const getSeverityIcon = (severity: string): string => {
    const icons: SeverityIcons = {
      success: 'pi pi-check-circle',
      info: 'pi pi-megaphone',
      warn: 'pi pi-exclamation-triangle',
      error: 'pi pi-exclamation-circle',
    };
    return icons[severity] || 'pi pi-info-circle';
  };

  return (
    <div className='message-container'>
      <div className='message-content'>
        <div className='message-icon'>
          <i className={getSeverityIcon(message?.severity ?? 'info')} />
        </div>
        <div className='message-text'>
          <span className='message-summary'>{message?.summary}</span>
          <div className='message-detail'>{message?.detail}</div>
        </div>
      </div>
    </div>
  );
};

export default messageTemplate;
