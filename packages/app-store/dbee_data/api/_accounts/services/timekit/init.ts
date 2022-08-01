import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(__dirname, '../../../.env'),
});

const url = process.env.TIMEKIT_URL || '';
const apiKey = process.env.TIMEKIT_KEY || '';

const timekitInstance = axios.create({
  baseURL: url,
  headers: {
    'Content-Type': 'application/json',
  },
  auth: {
    username: '',
    password: apiKey,
  },
});

export default timekitInstance;
