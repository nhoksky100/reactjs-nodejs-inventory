import { v4 as uuidv4 } from 'uuid';

export const   randomId = () => {
    const lengthFirst = 0;
    const lengthLast = 11;
    // get id from 0-11
    const id = uuidv4();
    return id.slice(lengthFirst, lengthLast)
}