export type AuthorizationOptions = {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: 'comment' | 'upvote' | 'downvote' | 'tip' | 'followAccount' | 'followPage' | 'createPost';
  cancellationText?: React.ReactNode;
  confirmationText?: React.ReactNode;
  hideCancel?: boolean;
  onConfirm?: () => Promise<void> | void;
  onCancel?: () => Promise<void> | void;
};
