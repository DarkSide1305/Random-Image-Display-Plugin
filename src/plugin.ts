import streamDeck from "@elgato/streamdeck";
import { RandomImageAction } from "./actions/random-image-action";

console.log('[PLUGIN] Plugin starting...');

// Register the action
streamDeck.actions.registerAction(new RandomImageAction());

console.log('[PLUGIN] Action registered');

// Connect to Stream Deck
streamDeck.connect();

console.log('[PLUGIN] Connected to Stream Deck');