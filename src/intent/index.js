import eventHub from '@/eventHub';
import { createIntentLayer } from './intentLayer';

const intent = createIntentLayer(eventHub);

export default intent;
