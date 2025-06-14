export class AppError extends Error {
    public status: number;
    public error: string | null;
  
    constructor(message: string, status: number, error: string | null = null) {
        super(message);
    
        Object.setPrototypeOf(this, AppError.prototype);
    
        this.name = this.constructor.name;
        this.status = status;
        this.error = error;
    }
}
  