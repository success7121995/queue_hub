export type Message = {
    message_id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string | Date;
    sender: MessageUser;
    receiver: MessageUser;
};
  
export type MessageUser = {
user_id: string;
username: string;
fname: string;
lname: string;
Avatar?: { image_url: string };
};

export type MessagePreview = {
    message_id: string;
    content: string;
    created_at: string | Date;
    is_read: boolean;
    user: MessageUser;
};

export type MessageThread = {
    messages: Message[];
};