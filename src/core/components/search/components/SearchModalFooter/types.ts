import { KeyboardCommand, SearchAnalytics } from '../../types/common';

export interface SearchModalFooterProps {
  analyticsEnabled?: boolean;
  analytics?: SearchAnalytics;
  keyboardCommands?: KeyboardCommand[];
}
