import require$$0$2 from 'events';
import require$$1$2 from 'https';
import require$$2 from 'http';
import require$$3 from 'net';
import require$$4 from 'tls';
import require$$1$1 from 'crypto';
import require$$1 from 'stream';
import require$$7 from 'url';
import require$$0 from 'zlib';
import require$$0$1 from 'buffer';
import fs, { existsSync, readFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { cwd } from 'node:process';
import { randomUUID } from 'node:crypto';
import { readFileSync as readFileSync$1 } from 'fs';
import require$$0$3 from 'util';
import require$$0$4 from 'assert';

/**
 * Default language supported by all i18n providers.
 */
const defaultLanguage = "en";

/**
 * Creates a {@link IDisposable} that defers the disposing to the {@link dispose} function; disposing is guarded so that it may only occur once.
 * @param dispose Function responsible for disposing.
 * @returns Disposable whereby the disposing is delegated to the {@link dispose}  function.
 */
function deferredDisposable(dispose) {
    let isDisposed = false;
    const guardedDispose = () => {
        if (!isDisposed) {
            dispose();
            isDisposed = true;
        }
    };
    return {
        [Symbol.dispose]: guardedDispose,
        dispose: guardedDispose,
    };
}

/**
 * An event emitter that enables the listening for, and emitting of, events.
 */
class EventEmitter {
    /**
     * Underlying collection of events and their listeners.
     */
    events = new Map();
    /**
     * Adds the event {@link listener} for the event named {@link eventName}.
     * @param eventName Name of the event.
     * @param listener Event handler function.
     * @returns This instance with the {@link listener} added.
     */
    addListener(eventName, listener) {
        return this.add(eventName, listener, (listeners) => listeners.push({ listener }));
    }
    /**
     * Adds the event {@link listener} for the event named {@link eventName}, and returns a disposable capable of removing the event listener.
     * @param eventName Name of the event.
     * @param listener Event handler function.
     * @returns A disposable that removes the listener when disposed.
     */
    disposableOn(eventName, listener) {
        this.add(eventName, listener, (listeners) => listeners.push({ listener }));
        return deferredDisposable(() => this.removeListener(eventName, listener));
    }
    /**
     * Emits the {@link eventName}, invoking all event listeners with the specified {@link args}.
     * @param eventName Name of the event.
     * @param args Arguments supplied to each event listener.
     * @returns `true` when there was a listener associated with the event; otherwise `false`.
     */
    emit(eventName, ...args) {
        const listeners = this.events.get(eventName);
        if (listeners === undefined) {
            return false;
        }
        for (let i = 0; i < listeners.length;) {
            const { listener, once } = listeners[i];
            if (once) {
                this.remove(eventName, listeners, i);
            }
            else {
                i++;
            }
            listener(...args);
        }
        return true;
    }
    /**
     * Gets the event names with event listeners.
     * @returns Event names.
     */
    eventNames() {
        return Array.from(this.events.keys());
    }
    /**
     * Gets the number of event listeners for the event named {@link eventName}. When a {@link listener} is defined, only matching event listeners are counted.
     * @param eventName Name of the event.
     * @param listener Optional event listener to count.
     * @returns Number of event listeners.
     */
    listenerCount(eventName, listener) {
        const listeners = this.events.get(eventName);
        if (listeners === undefined || listener == undefined) {
            return listeners?.length || 0;
        }
        let count = 0;
        listeners.forEach((ev) => {
            if (ev.listener === listener) {
                count++;
            }
        });
        return count;
    }
    /**
     * Gets the event listeners for the event named {@link eventName}.
     * @param eventName Name of the event.
     * @returns The event listeners.
     */
    listeners(eventName) {
        return Array.from(this.events.get(eventName) || []).map(({ listener }) => listener);
    }
    /**
     * Removes the event {@link listener} for the event named {@link eventName}.
     * @param eventName Name of the event.
     * @param listener Event handler function.
     * @returns This instance with the event {@link listener} removed.
     */
    off(eventName, listener) {
        const listeners = this.events.get(eventName) ?? [];
        for (let i = listeners.length - 1; i >= 0; i--) {
            if (listeners[i].listener === listener) {
                this.remove(eventName, listeners, i);
            }
        }
        return this;
    }
    /**
     * Adds the event {@link listener} for the event named {@link eventName}.
     * @param eventName Name of the event.
     * @param listener Event handler function.
     * @returns This instance with the event {@link listener} added.
     */
    on(eventName, listener) {
        return this.add(eventName, listener, (listeners) => listeners.push({ listener }));
    }
    /**
     * Adds the **one-time** event {@link listener} for the event named {@link eventName}.
     * @param eventName Name of the event.
     * @param listener Event handler function.
     * @returns This instance with the event {@link listener} added.
     */
    once(eventName, listener) {
        return this.add(eventName, listener, (listeners) => listeners.push({ listener, once: true }));
    }
    /**
     * Adds the event {@link listener} to the beginning of the listeners for the event named {@link eventName}.
     * @param eventName Name of the event.
     * @param listener Event handler function.
     * @returns This instance with the event {@link listener} prepended.
     */
    prependListener(eventName, listener) {
        return this.add(eventName, listener, (listeners) => listeners.splice(0, 0, { listener }));
    }
    /**
     * Adds the **one-time** event {@link listener} to the beginning of the listeners for the event named {@link eventName}.
     * @param eventName Name of the event.
     * @param listener Event handler function.
     * @returns This instance with the event {@link listener} prepended.
     */
    prependOnceListener(eventName, listener) {
        return this.add(eventName, listener, (listeners) => listeners.splice(0, 0, { listener, once: true }));
    }
    /**
     * Removes all event listeners for the event named {@link eventName}.
     * @param eventName Name of the event.
     * @returns This instance with the event listeners removed
     */
    removeAllListeners(eventName) {
        const listeners = this.events.get(eventName) ?? [];
        while (listeners.length > 0) {
            this.remove(eventName, listeners, 0);
        }
        this.events.delete(eventName);
        return this;
    }
    /**
     * Removes the event {@link listener} for the event named {@link eventName}.
     * @param eventName Name of the event.
     * @param listener Event handler function.
     * @returns This instance with the event {@link listener} removed.
     */
    removeListener(eventName, listener) {
        return this.off(eventName, listener);
    }
    /**
     * Adds the event {@link listener} for the event named {@link eventName}.
     * @param eventName Name of the event.
     * @param listener Event handler function.
     * @param fn Function responsible for adding the new event handler function.
     * @returns This instance with event {@link listener} added.
     */
    add(eventName, listener, fn) {
        let listeners = this.events.get(eventName);
        if (listeners === undefined) {
            listeners = [];
            this.events.set(eventName, listeners);
        }
        fn(listeners);
        if (eventName !== "newListener") {
            const args = [eventName, listener];
            this.emit("newListener", ...args);
        }
        return this;
    }
    /**
     * Removes the listener at the given index.
     * @param eventName Name of the event.
     * @param listeners Listeners registered with the event.
     * @param index Index of the listener to remove.
     */
    remove(eventName, listeners, index) {
        const [{ listener }] = listeners.splice(index, 1);
        if (eventName !== "removeListener") {
            const args = [eventName, listener];
            this.emit("removeListener", ...args);
        }
    }
}

/**
 * Prevents the modification of existing property attributes and values on the value, and all of its child properties, and prevents the addition of new properties.
 * @param value Value to freeze.
 */
function freeze(value) {
    if (value !== undefined && value !== null && typeof value === "object" && !Object.isFrozen(value)) {
        Object.freeze(value);
        Object.values(value).forEach(freeze);
    }
}
/**
 * Gets the value at the specified {@link path}.
 * @param source Source object that is being read from.
 * @param path Path to the property to get.
 * @returns Value of the property.
 */
function get(source, path) {
    const props = path.split(".");
    return props.reduce((obj, prop) => obj && obj[prop], source);
}

/**
 * Internalization provider, responsible for managing localizations and translating resources.
 */
class I18nProvider {
    /**
     * Backing field for the default language.
     */
    #language;
    /**
     * Map of localized resources, indexed by their language.
     */
    #translations = new Map();
    /**
     * Function responsible for providing localized resources for a given language.
     */
    #readTranslations;
    /**
     * Internal events handler.
     */
    #events = new EventEmitter();
    /**
     * Initializes a new instance of the {@link I18nProvider} class.
     * @param language The default language to be used when retrieving translations for a given key.
     * @param readTranslations Function responsible for providing localized resources for a given language.
     */
    constructor(language, readTranslations) {
        this.#language = language;
        this.#readTranslations = readTranslations;
    }
    /**
     * The default language of the provider.
     * @returns The language.
     */
    get language() {
        return this.#language;
    }
    /**
     * The default language of the provider.
     * @param value The language.
     */
    set language(value) {
        if (this.#language !== value) {
            this.#language = value;
            this.#events.emit("languageChange", value);
        }
    }
    /**
     * Adds an event listener that is called when the language within the provider changes.
     * @param listener Listener function to be called.
     * @returns Resource manager that, when disposed, removes the event listener.
     */
    onLanguageChange(listener) {
        return this.#events.disposableOn("languageChange", listener);
    }
    /**
     * Translates the specified {@link key}, as defined within the resources for the {@link language}.
     * When the key is not found, the default language is checked. Alias of {@link I18nProvider.translate}.
     * @param key Key of the translation.
     * @param language Optional language to get the translation for; otherwise the default language.
     * @returns The translation; otherwise the key.
     */
    t(key, language = this.language) {
        return this.translate(key, language);
    }
    /**
     * Translates the specified {@link key}, as defined within the resources for the {@link language}.
     * When the key is not found, the default language is checked.
     * @param key Key of the translation.
     * @param language Optional language to get the translation for; otherwise the default language.
     * @returns The translation; otherwise the key.
     */
    translate(key, language = this.language) {
        // Determine the languages to search for.
        const languages = new Set([
            language,
            language.replaceAll("_", "-").split("-").at(0),
            defaultLanguage,
        ]);
        // Attempt to find the resource for the languages.
        for (const language of languages) {
            const resource = get(this.getTranslations(language), key);
            if (resource) {
                return resource.toString();
            }
        }
        // Otherwise fallback to the key.
        return key;
    }
    /**
     * Gets the translations for the specified language.
     * @param language Language whose translations are being retrieved.
     * @returns The translations; otherwise `null`.
     */
    getTranslations(language) {
        let translations = this.#translations.get(language);
        if (translations === undefined) {
            translations = this.#readTranslations(language);
            freeze(translations);
            this.#translations.set(language, translations);
        }
        return translations;
    }
}

/**
 * Provides a read-only iterable collection of items that also acts as a partial polyfill for iterator helpers.
 */
class Enumerable {
    /**
     * Backing function responsible for providing the iterator of items.
     */
    #items;
    /**
     * Backing function for {@link Enumerable.length}.
     */
    #length;
    /**
     * Captured iterator from the underlying iterable; used to fulfil {@link IterableIterator} methods.
     */
    #iterator;
    /**
     * Initializes a new instance of the {@link Enumerable} class.
     * @param source Source that contains the items.
     * @returns The enumerable.
     */
    constructor(source) {
        if (source instanceof Enumerable) {
            // Enumerable
            this.#items = source.#items;
            this.#length = source.#length;
        }
        else if (Array.isArray(source)) {
            // Array
            this.#items = () => source.values();
            this.#length = () => source.length;
        }
        else if (source instanceof Map || source instanceof Set) {
            // Map or Set
            this.#items = () => source.values();
            this.#length = () => source.size;
        }
        else {
            // IterableIterator delegate
            this.#items = source;
            this.#length = () => {
                let i = 0;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                for (const _ of this) {
                    i++;
                }
                return i;
            };
        }
    }
    /**
     * Gets the number of items in the enumerable.
     * @returns The number of items.
     */
    get length() {
        return this.#length();
    }
    /**
     * Gets the iterator for the enumerable.
     * @yields The items.
     */
    *[Symbol.iterator]() {
        for (const item of this.#items()) {
            yield item;
        }
    }
    /**
     * Transforms each item within this iterator to an indexed pair, with each pair represented as an array.
     * @returns An iterator of indexed pairs.
     */
    asIndexedPairs() {
        return new Enumerable(function* () {
            let i = 0;
            for (const item of this) {
                yield [i++, item];
            }
        }.bind(this));
    }
    /**
     * Returns an iterator with the first items dropped, up to the specified limit.
     * @param limit The number of elements to drop from the start of the iteration.
     * @returns An iterator of items after the limit.
     */
    drop(limit) {
        if (isNaN(limit) || limit < 0) {
            throw new RangeError("limit must be 0, or a positive number");
        }
        return new Enumerable(function* () {
            let i = 0;
            for (const item of this) {
                if (i++ >= limit) {
                    yield item;
                }
            }
        }.bind(this));
    }
    /**
     * Determines whether all items satisfy the specified predicate.
     * @param predicate Function that determines whether each item fulfils the predicate.
     * @returns `true` when all items satisfy the predicate; otherwise `false`.
     */
    every(predicate) {
        for (const item of this) {
            if (!predicate(item)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Returns an iterator of items that meet the specified predicate..
     * @param predicate Function that determines which items to filter.
     * @returns An iterator of filtered items.
     */
    filter(predicate) {
        return new Enumerable(function* () {
            for (const item of this) {
                if (predicate(item)) {
                    yield item;
                }
            }
        }.bind(this));
    }
    /**
     * Finds the first item that satisfies the specified predicate.
     * @param predicate Predicate to match items against.
     * @returns The first item that satisfied the predicate; otherwise `undefined`.
     */
    find(predicate) {
        for (const item of this) {
            if (predicate(item)) {
                return item;
            }
        }
    }
    /**
     * Finds the last item that satisfies the specified predicate.
     * @param predicate Predicate to match items against.
     * @returns The first item that satisfied the predicate; otherwise `undefined`.
     */
    findLast(predicate) {
        let result = undefined;
        for (const item of this) {
            if (predicate(item)) {
                result = item;
            }
        }
        return result;
    }
    /**
     * Returns an iterator containing items transformed using the specified mapper function.
     * @param mapper Function responsible for transforming each item.
     * @returns An iterator of transformed items.
     */
    flatMap(mapper) {
        return new Enumerable(function* () {
            for (const item of this) {
                for (const mapped of mapper(item)) {
                    yield mapped;
                }
            }
        }.bind(this));
    }
    /**
     * Iterates over each item, and invokes the specified function.
     * @param fn Function to invoke against each item.
     */
    forEach(fn) {
        for (const item of this) {
            fn(item);
        }
    }
    /**
     * Determines whether the search item exists in the collection exists.
     * @param search Item to search for.
     * @returns `true` when the item was found; otherwise `false`.
     */
    includes(search) {
        return this.some((item) => item === search);
    }
    /**
     * Returns an iterator of mapped items using the mapper function.
     * @param mapper Function responsible for mapping the items.
     * @returns An iterator of mapped items.
     */
    map(mapper) {
        return new Enumerable(function* () {
            for (const item of this) {
                yield mapper(item);
            }
        }.bind(this));
    }
    /**
     * Captures the underlying iterable, if it is not already captured, and gets the next item in the iterator.
     * @param args Optional values to send to the generator.
     * @returns An iterator result of the current iteration; when `done` is `false`, the current `value` is provided.
     */
    next(...args) {
        this.#iterator ??= this.#items();
        const result = this.#iterator.next(...args);
        if (result.done) {
            this.#iterator = undefined;
        }
        return result;
    }
    /**
     * Applies the accumulator function to each item, and returns the result.
     * @param accumulator Function responsible for accumulating all items within the collection.
     * @param initial Initial value supplied to the accumulator.
     * @returns Result of accumulating each value.
     */
    reduce(accumulator, initial) {
        if (this.length === 0) {
            if (initial === undefined) {
                throw new TypeError("Reduce of empty enumerable with no initial value.");
            }
            return initial;
        }
        let result = initial;
        for (const item of this) {
            if (result === undefined) {
                result = item;
            }
            else {
                result = accumulator(result, item);
            }
        }
        return result;
    }
    /**
     * Acts as if a `return` statement is inserted in the generator's body at the current suspended position.
     *
     * Please note, in the context of an {@link Enumerable}, calling {@link Enumerable.return} will clear the captured iterator,
     * if there is one. Subsequent calls to {@link Enumerable.next} will result in re-capturing the underlying iterable, and
     * yielding items from the beginning.
     * @param value Value to return.
     * @returns The value as an iterator result.
     */
    return(value) {
        this.#iterator = undefined;
        return { done: true, value };
    }
    /**
     * Determines whether an item in the collection exists that satisfies the specified predicate.
     * @param predicate Function used to search for an item.
     * @returns `true` when the item was found; otherwise `false`.
     */
    some(predicate) {
        for (const item of this) {
            if (predicate(item)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Returns an iterator with the items, from 0, up to the specified limit.
     * @param limit Limit of items to take.
     * @returns An iterator of items from 0 to the limit.
     */
    take(limit) {
        if (isNaN(limit) || limit < 0) {
            throw new RangeError("limit must be 0, or a positive number");
        }
        return new Enumerable(function* () {
            let i = 0;
            for (const item of this) {
                if (i++ < limit) {
                    yield item;
                }
            }
        }.bind(this));
    }
    /**
     * Acts as if a `throw` statement is inserted in the generator's body at the current suspended position.
     * @param e Error to throw.
     */
    throw(e) {
        throw e;
    }
    /**
     * Converts this iterator to an array.
     * @returns The array of items from this iterator.
     */
    toArray() {
        return Array.from(this);
    }
    /**
     * Converts this iterator to serializable collection.
     * @returns The serializable collection of items.
     */
    toJSON() {
        return this.toArray();
    }
    /**
     * Converts this iterator to a string.
     * @returns The string.
     */
    toString() {
        return `${this.toArray()}`;
    }
}

// Polyfill, explicit resource management https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Symbol.dispose ??= Symbol("Symbol.dispose");

/**
 * Provides a wrapper around a value that is lazily instantiated.
 */
class Lazy {
    /**
     * Private backing field for {@link Lazy.value}.
     */
    #value = undefined;
    /**
     * Factory responsible for instantiating the value.
     */
    #valueFactory;
    /**
     * Initializes a new instance of the {@link Lazy} class.
     * @param valueFactory The factory responsible for instantiating the value.
     */
    constructor(valueFactory) {
        this.#valueFactory = valueFactory;
    }
    /**
     * Gets the value.
     * @returns The value.
     */
    get value() {
        if (this.#value === undefined) {
            this.#value = this.#valueFactory();
        }
        return this.#value;
    }
}

/**
 * Returns an object that contains a promise and two functions to resolve or reject it.
 * @returns The promise, and the resolve and reject functions.
 */
function withResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var bufferUtil = {exports: {}};

var constants$1;
var hasRequiredConstants$1;

function requireConstants$1 () {
	if (hasRequiredConstants$1) return constants$1;
	hasRequiredConstants$1 = 1;

	const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
	const hasBlob = typeof Blob !== 'undefined';

	if (hasBlob) BINARY_TYPES.push('blob');

	constants$1 = {
	  BINARY_TYPES,
	  EMPTY_BUFFER: Buffer.alloc(0),
	  GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
	  hasBlob,
	  kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),
	  kListener: Symbol('kListener'),
	  kStatusCode: Symbol('status-code'),
	  kWebSocket: Symbol('websocket'),
	  NOOP: () => {}
	};
	return constants$1;
}

var hasRequiredBufferUtil;

function requireBufferUtil () {
	if (hasRequiredBufferUtil) return bufferUtil.exports;
	hasRequiredBufferUtil = 1;

	const { EMPTY_BUFFER } = requireConstants$1();

	const FastBuffer = Buffer[Symbol.species];

	/**
	 * Merges an array of buffers into a new buffer.
	 *
	 * @param {Buffer[]} list The array of buffers to concat
	 * @param {Number} totalLength The total length of buffers in the list
	 * @return {Buffer} The resulting buffer
	 * @public
	 */
	function concat(list, totalLength) {
	  if (list.length === 0) return EMPTY_BUFFER;
	  if (list.length === 1) return list[0];

	  const target = Buffer.allocUnsafe(totalLength);
	  let offset = 0;

	  for (let i = 0; i < list.length; i++) {
	    const buf = list[i];
	    target.set(buf, offset);
	    offset += buf.length;
	  }

	  if (offset < totalLength) {
	    return new FastBuffer(target.buffer, target.byteOffset, offset);
	  }

	  return target;
	}

	/**
	 * Masks a buffer using the given mask.
	 *
	 * @param {Buffer} source The buffer to mask
	 * @param {Buffer} mask The mask to use
	 * @param {Buffer} output The buffer where to store the result
	 * @param {Number} offset The offset at which to start writing
	 * @param {Number} length The number of bytes to mask.
	 * @public
	 */
	function _mask(source, mask, output, offset, length) {
	  for (let i = 0; i < length; i++) {
	    output[offset + i] = source[i] ^ mask[i & 3];
	  }
	}

	/**
	 * Unmasks a buffer using the given mask.
	 *
	 * @param {Buffer} buffer The buffer to unmask
	 * @param {Buffer} mask The mask to use
	 * @public
	 */
	function _unmask(buffer, mask) {
	  for (let i = 0; i < buffer.length; i++) {
	    buffer[i] ^= mask[i & 3];
	  }
	}

	/**
	 * Converts a buffer to an `ArrayBuffer`.
	 *
	 * @param {Buffer} buf The buffer to convert
	 * @return {ArrayBuffer} Converted buffer
	 * @public
	 */
	function toArrayBuffer(buf) {
	  if (buf.length === buf.buffer.byteLength) {
	    return buf.buffer;
	  }

	  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
	}

	/**
	 * Converts `data` to a `Buffer`.
	 *
	 * @param {*} data The data to convert
	 * @return {Buffer} The buffer
	 * @throws {TypeError}
	 * @public
	 */
	function toBuffer(data) {
	  toBuffer.readOnly = true;

	  if (Buffer.isBuffer(data)) return data;

	  let buf;

	  if (data instanceof ArrayBuffer) {
	    buf = new FastBuffer(data);
	  } else if (ArrayBuffer.isView(data)) {
	    buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
	  } else {
	    buf = Buffer.from(data);
	    toBuffer.readOnly = false;
	  }

	  return buf;
	}

	bufferUtil.exports = {
	  concat,
	  mask: _mask,
	  toArrayBuffer,
	  toBuffer,
	  unmask: _unmask
	};

	/* istanbul ignore else  */
	if (!process.env.WS_NO_BUFFER_UTIL) {
	  try {
	    const bufferUtil$1 = require('bufferutil');

	    bufferUtil.exports.mask = function (source, mask, output, offset, length) {
	      if (length < 48) _mask(source, mask, output, offset, length);
	      else bufferUtil$1.mask(source, mask, output, offset, length);
	    };

	    bufferUtil.exports.unmask = function (buffer, mask) {
	      if (buffer.length < 32) _unmask(buffer, mask);
	      else bufferUtil$1.unmask(buffer, mask);
	    };
	  } catch (e) {
	    // Continue regardless of the error.
	  }
	}
	return bufferUtil.exports;
}

var limiter;
var hasRequiredLimiter;

function requireLimiter () {
	if (hasRequiredLimiter) return limiter;
	hasRequiredLimiter = 1;

	const kDone = Symbol('kDone');
	const kRun = Symbol('kRun');

	/**
	 * A very simple job queue with adjustable concurrency. Adapted from
	 * https://github.com/STRML/async-limiter
	 */
	class Limiter {
	  /**
	   * Creates a new `Limiter`.
	   *
	   * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
	   *     to run concurrently
	   */
	  constructor(concurrency) {
	    this[kDone] = () => {
	      this.pending--;
	      this[kRun]();
	    };
	    this.concurrency = concurrency || Infinity;
	    this.jobs = [];
	    this.pending = 0;
	  }

	  /**
	   * Adds a job to the queue.
	   *
	   * @param {Function} job The job to run
	   * @public
	   */
	  add(job) {
	    this.jobs.push(job);
	    this[kRun]();
	  }

	  /**
	   * Removes a job from the queue and runs it if possible.
	   *
	   * @private
	   */
	  [kRun]() {
	    if (this.pending === this.concurrency) return;

	    if (this.jobs.length) {
	      const job = this.jobs.shift();

	      this.pending++;
	      job(this[kDone]);
	    }
	  }
	}

	limiter = Limiter;
	return limiter;
}

var permessageDeflate;
var hasRequiredPermessageDeflate;

function requirePermessageDeflate () {
	if (hasRequiredPermessageDeflate) return permessageDeflate;
	hasRequiredPermessageDeflate = 1;

	const zlib = require$$0;

	const bufferUtil = requireBufferUtil();
	const Limiter = requireLimiter();
	const { kStatusCode } = requireConstants$1();

	const FastBuffer = Buffer[Symbol.species];
	const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
	const kPerMessageDeflate = Symbol('permessage-deflate');
	const kTotalLength = Symbol('total-length');
	const kCallback = Symbol('callback');
	const kBuffers = Symbol('buffers');
	const kError = Symbol('error');

	//
	// We limit zlib concurrency, which prevents severe memory fragmentation
	// as documented in https://github.com/nodejs/node/issues/8871#issuecomment-250915913
	// and https://github.com/websockets/ws/issues/1202
	//
	// Intentionally global; it's the global thread pool that's an issue.
	//
	let zlibLimiter;

	/**
	 * permessage-deflate implementation.
	 */
	class PerMessageDeflate {
	  /**
	   * Creates a PerMessageDeflate instance.
	   *
	   * @param {Object} [options] Configuration options
	   * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
	   *     for, or request, a custom client window size
	   * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
	   *     acknowledge disabling of client context takeover
	   * @param {Number} [options.concurrencyLimit=10] The number of concurrent
	   *     calls to zlib
	   * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
	   *     use of a custom server window size
	   * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
	   *     disabling of server context takeover
	   * @param {Number} [options.threshold=1024] Size (in bytes) below which
	   *     messages should not be compressed if context takeover is disabled
	   * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
	   *     deflate
	   * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
	   *     inflate
	   * @param {Boolean} [isServer=false] Create the instance in either server or
	   *     client mode
	   * @param {Number} [maxPayload=0] The maximum allowed message length
	   */
	  constructor(options, isServer, maxPayload) {
	    this._maxPayload = maxPayload | 0;
	    this._options = options || {};
	    this._threshold =
	      this._options.threshold !== undefined ? this._options.threshold : 1024;
	    this._isServer = !!isServer;
	    this._deflate = null;
	    this._inflate = null;

	    this.params = null;

	    if (!zlibLimiter) {
	      const concurrency =
	        this._options.concurrencyLimit !== undefined
	          ? this._options.concurrencyLimit
	          : 10;
	      zlibLimiter = new Limiter(concurrency);
	    }
	  }

	  /**
	   * @type {String}
	   */
	  static get extensionName() {
	    return 'permessage-deflate';
	  }

	  /**
	   * Create an extension negotiation offer.
	   *
	   * @return {Object} Extension parameters
	   * @public
	   */
	  offer() {
	    const params = {};

	    if (this._options.serverNoContextTakeover) {
	      params.server_no_context_takeover = true;
	    }
	    if (this._options.clientNoContextTakeover) {
	      params.client_no_context_takeover = true;
	    }
	    if (this._options.serverMaxWindowBits) {
	      params.server_max_window_bits = this._options.serverMaxWindowBits;
	    }
	    if (this._options.clientMaxWindowBits) {
	      params.client_max_window_bits = this._options.clientMaxWindowBits;
	    } else if (this._options.clientMaxWindowBits == null) {
	      params.client_max_window_bits = true;
	    }

	    return params;
	  }

	  /**
	   * Accept an extension negotiation offer/response.
	   *
	   * @param {Array} configurations The extension negotiation offers/reponse
	   * @return {Object} Accepted configuration
	   * @public
	   */
	  accept(configurations) {
	    configurations = this.normalizeParams(configurations);

	    this.params = this._isServer
	      ? this.acceptAsServer(configurations)
	      : this.acceptAsClient(configurations);

	    return this.params;
	  }

	  /**
	   * Releases all resources used by the extension.
	   *
	   * @public
	   */
	  cleanup() {
	    if (this._inflate) {
	      this._inflate.close();
	      this._inflate = null;
	    }

	    if (this._deflate) {
	      const callback = this._deflate[kCallback];

	      this._deflate.close();
	      this._deflate = null;

	      if (callback) {
	        callback(
	          new Error(
	            'The deflate stream was closed while data was being processed'
	          )
	        );
	      }
	    }
	  }

	  /**
	   *  Accept an extension negotiation offer.
	   *
	   * @param {Array} offers The extension negotiation offers
	   * @return {Object} Accepted configuration
	   * @private
	   */
	  acceptAsServer(offers) {
	    const opts = this._options;
	    const accepted = offers.find((params) => {
	      if (
	        (opts.serverNoContextTakeover === false &&
	          params.server_no_context_takeover) ||
	        (params.server_max_window_bits &&
	          (opts.serverMaxWindowBits === false ||
	            (typeof opts.serverMaxWindowBits === 'number' &&
	              opts.serverMaxWindowBits > params.server_max_window_bits))) ||
	        (typeof opts.clientMaxWindowBits === 'number' &&
	          !params.client_max_window_bits)
	      ) {
	        return false;
	      }

	      return true;
	    });

	    if (!accepted) {
	      throw new Error('None of the extension offers can be accepted');
	    }

	    if (opts.serverNoContextTakeover) {
	      accepted.server_no_context_takeover = true;
	    }
	    if (opts.clientNoContextTakeover) {
	      accepted.client_no_context_takeover = true;
	    }
	    if (typeof opts.serverMaxWindowBits === 'number') {
	      accepted.server_max_window_bits = opts.serverMaxWindowBits;
	    }
	    if (typeof opts.clientMaxWindowBits === 'number') {
	      accepted.client_max_window_bits = opts.clientMaxWindowBits;
	    } else if (
	      accepted.client_max_window_bits === true ||
	      opts.clientMaxWindowBits === false
	    ) {
	      delete accepted.client_max_window_bits;
	    }

	    return accepted;
	  }

	  /**
	   * Accept the extension negotiation response.
	   *
	   * @param {Array} response The extension negotiation response
	   * @return {Object} Accepted configuration
	   * @private
	   */
	  acceptAsClient(response) {
	    const params = response[0];

	    if (
	      this._options.clientNoContextTakeover === false &&
	      params.client_no_context_takeover
	    ) {
	      throw new Error('Unexpected parameter "client_no_context_takeover"');
	    }

	    if (!params.client_max_window_bits) {
	      if (typeof this._options.clientMaxWindowBits === 'number') {
	        params.client_max_window_bits = this._options.clientMaxWindowBits;
	      }
	    } else if (
	      this._options.clientMaxWindowBits === false ||
	      (typeof this._options.clientMaxWindowBits === 'number' &&
	        params.client_max_window_bits > this._options.clientMaxWindowBits)
	    ) {
	      throw new Error(
	        'Unexpected or invalid parameter "client_max_window_bits"'
	      );
	    }

	    return params;
	  }

	  /**
	   * Normalize parameters.
	   *
	   * @param {Array} configurations The extension negotiation offers/reponse
	   * @return {Array} The offers/response with normalized parameters
	   * @private
	   */
	  normalizeParams(configurations) {
	    configurations.forEach((params) => {
	      Object.keys(params).forEach((key) => {
	        let value = params[key];

	        if (value.length > 1) {
	          throw new Error(`Parameter "${key}" must have only a single value`);
	        }

	        value = value[0];

	        if (key === 'client_max_window_bits') {
	          if (value !== true) {
	            const num = +value;
	            if (!Number.isInteger(num) || num < 8 || num > 15) {
	              throw new TypeError(
	                `Invalid value for parameter "${key}": ${value}`
	              );
	            }
	            value = num;
	          } else if (!this._isServer) {
	            throw new TypeError(
	              `Invalid value for parameter "${key}": ${value}`
	            );
	          }
	        } else if (key === 'server_max_window_bits') {
	          const num = +value;
	          if (!Number.isInteger(num) || num < 8 || num > 15) {
	            throw new TypeError(
	              `Invalid value for parameter "${key}": ${value}`
	            );
	          }
	          value = num;
	        } else if (
	          key === 'client_no_context_takeover' ||
	          key === 'server_no_context_takeover'
	        ) {
	          if (value !== true) {
	            throw new TypeError(
	              `Invalid value for parameter "${key}": ${value}`
	            );
	          }
	        } else {
	          throw new Error(`Unknown parameter "${key}"`);
	        }

	        params[key] = value;
	      });
	    });

	    return configurations;
	  }

	  /**
	   * Decompress data. Concurrency limited.
	   *
	   * @param {Buffer} data Compressed data
	   * @param {Boolean} fin Specifies whether or not this is the last fragment
	   * @param {Function} callback Callback
	   * @public
	   */
	  decompress(data, fin, callback) {
	    zlibLimiter.add((done) => {
	      this._decompress(data, fin, (err, result) => {
	        done();
	        callback(err, result);
	      });
	    });
	  }

	  /**
	   * Compress data. Concurrency limited.
	   *
	   * @param {(Buffer|String)} data Data to compress
	   * @param {Boolean} fin Specifies whether or not this is the last fragment
	   * @param {Function} callback Callback
	   * @public
	   */
	  compress(data, fin, callback) {
	    zlibLimiter.add((done) => {
	      this._compress(data, fin, (err, result) => {
	        done();
	        callback(err, result);
	      });
	    });
	  }

	  /**
	   * Decompress data.
	   *
	   * @param {Buffer} data Compressed data
	   * @param {Boolean} fin Specifies whether or not this is the last fragment
	   * @param {Function} callback Callback
	   * @private
	   */
	  _decompress(data, fin, callback) {
	    const endpoint = this._isServer ? 'client' : 'server';

	    if (!this._inflate) {
	      const key = `${endpoint}_max_window_bits`;
	      const windowBits =
	        typeof this.params[key] !== 'number'
	          ? zlib.Z_DEFAULT_WINDOWBITS
	          : this.params[key];

	      this._inflate = zlib.createInflateRaw({
	        ...this._options.zlibInflateOptions,
	        windowBits
	      });
	      this._inflate[kPerMessageDeflate] = this;
	      this._inflate[kTotalLength] = 0;
	      this._inflate[kBuffers] = [];
	      this._inflate.on('error', inflateOnError);
	      this._inflate.on('data', inflateOnData);
	    }

	    this._inflate[kCallback] = callback;

	    this._inflate.write(data);
	    if (fin) this._inflate.write(TRAILER);

	    this._inflate.flush(() => {
	      const err = this._inflate[kError];

	      if (err) {
	        this._inflate.close();
	        this._inflate = null;
	        callback(err);
	        return;
	      }

	      const data = bufferUtil.concat(
	        this._inflate[kBuffers],
	        this._inflate[kTotalLength]
	      );

	      if (this._inflate._readableState.endEmitted) {
	        this._inflate.close();
	        this._inflate = null;
	      } else {
	        this._inflate[kTotalLength] = 0;
	        this._inflate[kBuffers] = [];

	        if (fin && this.params[`${endpoint}_no_context_takeover`]) {
	          this._inflate.reset();
	        }
	      }

	      callback(null, data);
	    });
	  }

	  /**
	   * Compress data.
	   *
	   * @param {(Buffer|String)} data Data to compress
	   * @param {Boolean} fin Specifies whether or not this is the last fragment
	   * @param {Function} callback Callback
	   * @private
	   */
	  _compress(data, fin, callback) {
	    const endpoint = this._isServer ? 'server' : 'client';

	    if (!this._deflate) {
	      const key = `${endpoint}_max_window_bits`;
	      const windowBits =
	        typeof this.params[key] !== 'number'
	          ? zlib.Z_DEFAULT_WINDOWBITS
	          : this.params[key];

	      this._deflate = zlib.createDeflateRaw({
	        ...this._options.zlibDeflateOptions,
	        windowBits
	      });

	      this._deflate[kTotalLength] = 0;
	      this._deflate[kBuffers] = [];

	      this._deflate.on('data', deflateOnData);
	    }

	    this._deflate[kCallback] = callback;

	    this._deflate.write(data);
	    this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
	      if (!this._deflate) {
	        //
	        // The deflate stream was closed while data was being processed.
	        //
	        return;
	      }

	      let data = bufferUtil.concat(
	        this._deflate[kBuffers],
	        this._deflate[kTotalLength]
	      );

	      if (fin) {
	        data = new FastBuffer(data.buffer, data.byteOffset, data.length - 4);
	      }

	      //
	      // Ensure that the callback will not be called again in
	      // `PerMessageDeflate#cleanup()`.
	      //
	      this._deflate[kCallback] = null;

	      this._deflate[kTotalLength] = 0;
	      this._deflate[kBuffers] = [];

	      if (fin && this.params[`${endpoint}_no_context_takeover`]) {
	        this._deflate.reset();
	      }

	      callback(null, data);
	    });
	  }
	}

	permessageDeflate = PerMessageDeflate;

	/**
	 * The listener of the `zlib.DeflateRaw` stream `'data'` event.
	 *
	 * @param {Buffer} chunk A chunk of data
	 * @private
	 */
	function deflateOnData(chunk) {
	  this[kBuffers].push(chunk);
	  this[kTotalLength] += chunk.length;
	}

	/**
	 * The listener of the `zlib.InflateRaw` stream `'data'` event.
	 *
	 * @param {Buffer} chunk A chunk of data
	 * @private
	 */
	function inflateOnData(chunk) {
	  this[kTotalLength] += chunk.length;

	  if (
	    this[kPerMessageDeflate]._maxPayload < 1 ||
	    this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload
	  ) {
	    this[kBuffers].push(chunk);
	    return;
	  }

	  this[kError] = new RangeError('Max payload size exceeded');
	  this[kError].code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';
	  this[kError][kStatusCode] = 1009;
	  this.removeListener('data', inflateOnData);

	  //
	  // The choice to employ `zlib.reset()` over `zlib.close()` is dictated by the
	  // fact that in Node.js versions prior to 13.10.0, the callback for
	  // `zlib.flush()` is not called if `zlib.close()` is used. Utilizing
	  // `zlib.reset()` ensures that either the callback is invoked or an error is
	  // emitted.
	  //
	  this.reset();
	}

	/**
	 * The listener of the `zlib.InflateRaw` stream `'error'` event.
	 *
	 * @param {Error} err The emitted error
	 * @private
	 */
	function inflateOnError(err) {
	  //
	  // There is no need to call `Zlib#close()` as the handle is automatically
	  // closed when an error is emitted.
	  //
	  this[kPerMessageDeflate]._inflate = null;

	  if (this[kError]) {
	    this[kCallback](this[kError]);
	    return;
	  }

	  err[kStatusCode] = 1007;
	  this[kCallback](err);
	}
	return permessageDeflate;
}

var validation = {exports: {}};

var hasRequiredValidation;

function requireValidation () {
	if (hasRequiredValidation) return validation.exports;
	hasRequiredValidation = 1;

	const { isUtf8 } = require$$0$1;

	const { hasBlob } = requireConstants$1();

	//
	// Allowed token characters:
	//
	// '!', '#', '$', '%', '&', ''', '*', '+', '-',
	// '.', 0-9, A-Z, '^', '_', '`', a-z, '|', '~'
	//
	// tokenChars[32] === 0 // ' '
	// tokenChars[33] === 1 // '!'
	// tokenChars[34] === 0 // '"'
	// ...
	//
	// prettier-ignore
	const tokenChars = [
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
	  0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, // 32 - 47
	  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63
	  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79
	  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, // 80 - 95
	  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111
	  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0 // 112 - 127
	];

	/**
	 * Checks if a status code is allowed in a close frame.
	 *
	 * @param {Number} code The status code
	 * @return {Boolean} `true` if the status code is valid, else `false`
	 * @public
	 */
	function isValidStatusCode(code) {
	  return (
	    (code >= 1000 &&
	      code <= 1014 &&
	      code !== 1004 &&
	      code !== 1005 &&
	      code !== 1006) ||
	    (code >= 3000 && code <= 4999)
	  );
	}

	/**
	 * Checks if a given buffer contains only correct UTF-8.
	 * Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by
	 * Markus Kuhn.
	 *
	 * @param {Buffer} buf The buffer to check
	 * @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`
	 * @public
	 */
	function _isValidUTF8(buf) {
	  const len = buf.length;
	  let i = 0;

	  while (i < len) {
	    if ((buf[i] & 0x80) === 0) {
	      // 0xxxxxxx
	      i++;
	    } else if ((buf[i] & 0xe0) === 0xc0) {
	      // 110xxxxx 10xxxxxx
	      if (
	        i + 1 === len ||
	        (buf[i + 1] & 0xc0) !== 0x80 ||
	        (buf[i] & 0xfe) === 0xc0 // Overlong
	      ) {
	        return false;
	      }

	      i += 2;
	    } else if ((buf[i] & 0xf0) === 0xe0) {
	      // 1110xxxx 10xxxxxx 10xxxxxx
	      if (
	        i + 2 >= len ||
	        (buf[i + 1] & 0xc0) !== 0x80 ||
	        (buf[i + 2] & 0xc0) !== 0x80 ||
	        (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) || // Overlong
	        (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0) // Surrogate (U+D800 - U+DFFF)
	      ) {
	        return false;
	      }

	      i += 3;
	    } else if ((buf[i] & 0xf8) === 0xf0) {
	      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
	      if (
	        i + 3 >= len ||
	        (buf[i + 1] & 0xc0) !== 0x80 ||
	        (buf[i + 2] & 0xc0) !== 0x80 ||
	        (buf[i + 3] & 0xc0) !== 0x80 ||
	        (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) || // Overlong
	        (buf[i] === 0xf4 && buf[i + 1] > 0x8f) ||
	        buf[i] > 0xf4 // > U+10FFFF
	      ) {
	        return false;
	      }

	      i += 4;
	    } else {
	      return false;
	    }
	  }

	  return true;
	}

	/**
	 * Determines whether a value is a `Blob`.
	 *
	 * @param {*} value The value to be tested
	 * @return {Boolean} `true` if `value` is a `Blob`, else `false`
	 * @private
	 */
	function isBlob(value) {
	  return (
	    hasBlob &&
	    typeof value === 'object' &&
	    typeof value.arrayBuffer === 'function' &&
	    typeof value.type === 'string' &&
	    typeof value.stream === 'function' &&
	    (value[Symbol.toStringTag] === 'Blob' ||
	      value[Symbol.toStringTag] === 'File')
	  );
	}

	validation.exports = {
	  isBlob,
	  isValidStatusCode,
	  isValidUTF8: _isValidUTF8,
	  tokenChars
	};

	if (isUtf8) {
	  validation.exports.isValidUTF8 = function (buf) {
	    return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
	  };
	} /* istanbul ignore else  */ else if (!process.env.WS_NO_UTF_8_VALIDATE) {
	  try {
	    const isValidUTF8 = require('utf-8-validate');

	    validation.exports.isValidUTF8 = function (buf) {
	      return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
	    };
	  } catch (e) {
	    // Continue regardless of the error.
	  }
	}
	return validation.exports;
}

var receiver;
var hasRequiredReceiver;

function requireReceiver () {
	if (hasRequiredReceiver) return receiver;
	hasRequiredReceiver = 1;

	const { Writable } = require$$1;

	const PerMessageDeflate = requirePermessageDeflate();
	const {
	  BINARY_TYPES,
	  EMPTY_BUFFER,
	  kStatusCode,
	  kWebSocket
	} = requireConstants$1();
	const { concat, toArrayBuffer, unmask } = requireBufferUtil();
	const { isValidStatusCode, isValidUTF8 } = requireValidation();

	const FastBuffer = Buffer[Symbol.species];

	const GET_INFO = 0;
	const GET_PAYLOAD_LENGTH_16 = 1;
	const GET_PAYLOAD_LENGTH_64 = 2;
	const GET_MASK = 3;
	const GET_DATA = 4;
	const INFLATING = 5;
	const DEFER_EVENT = 6;

	/**
	 * HyBi Receiver implementation.
	 *
	 * @extends Writable
	 */
	class Receiver extends Writable {
	  /**
	   * Creates a Receiver instance.
	   *
	   * @param {Object} [options] Options object
	   * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
	   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
	   *     multiple times in the same tick
	   * @param {String} [options.binaryType=nodebuffer] The type for binary data
	   * @param {Object} [options.extensions] An object containing the negotiated
	   *     extensions
	   * @param {Boolean} [options.isServer=false] Specifies whether to operate in
	   *     client or server mode
	   * @param {Number} [options.maxPayload=0] The maximum allowed message length
	   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
	   *     not to skip UTF-8 validation for text and close messages
	   */
	  constructor(options = {}) {
	    super();

	    this._allowSynchronousEvents =
	      options.allowSynchronousEvents !== undefined
	        ? options.allowSynchronousEvents
	        : true;
	    this._binaryType = options.binaryType || BINARY_TYPES[0];
	    this._extensions = options.extensions || {};
	    this._isServer = !!options.isServer;
	    this._maxPayload = options.maxPayload | 0;
	    this._skipUTF8Validation = !!options.skipUTF8Validation;
	    this[kWebSocket] = undefined;

	    this._bufferedBytes = 0;
	    this._buffers = [];

	    this._compressed = false;
	    this._payloadLength = 0;
	    this._mask = undefined;
	    this._fragmented = 0;
	    this._masked = false;
	    this._fin = false;
	    this._opcode = 0;

	    this._totalPayloadLength = 0;
	    this._messageLength = 0;
	    this._fragments = [];

	    this._errored = false;
	    this._loop = false;
	    this._state = GET_INFO;
	  }

	  /**
	   * Implements `Writable.prototype._write()`.
	   *
	   * @param {Buffer} chunk The chunk of data to write
	   * @param {String} encoding The character encoding of `chunk`
	   * @param {Function} cb Callback
	   * @private
	   */
	  _write(chunk, encoding, cb) {
	    if (this._opcode === 0x08 && this._state == GET_INFO) return cb();

	    this._bufferedBytes += chunk.length;
	    this._buffers.push(chunk);
	    this.startLoop(cb);
	  }

	  /**
	   * Consumes `n` bytes from the buffered data.
	   *
	   * @param {Number} n The number of bytes to consume
	   * @return {Buffer} The consumed bytes
	   * @private
	   */
	  consume(n) {
	    this._bufferedBytes -= n;

	    if (n === this._buffers[0].length) return this._buffers.shift();

	    if (n < this._buffers[0].length) {
	      const buf = this._buffers[0];
	      this._buffers[0] = new FastBuffer(
	        buf.buffer,
	        buf.byteOffset + n,
	        buf.length - n
	      );

	      return new FastBuffer(buf.buffer, buf.byteOffset, n);
	    }

	    const dst = Buffer.allocUnsafe(n);

	    do {
	      const buf = this._buffers[0];
	      const offset = dst.length - n;

	      if (n >= buf.length) {
	        dst.set(this._buffers.shift(), offset);
	      } else {
	        dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
	        this._buffers[0] = new FastBuffer(
	          buf.buffer,
	          buf.byteOffset + n,
	          buf.length - n
	        );
	      }

	      n -= buf.length;
	    } while (n > 0);

	    return dst;
	  }

	  /**
	   * Starts the parsing loop.
	   *
	   * @param {Function} cb Callback
	   * @private
	   */
	  startLoop(cb) {
	    this._loop = true;

	    do {
	      switch (this._state) {
	        case GET_INFO:
	          this.getInfo(cb);
	          break;
	        case GET_PAYLOAD_LENGTH_16:
	          this.getPayloadLength16(cb);
	          break;
	        case GET_PAYLOAD_LENGTH_64:
	          this.getPayloadLength64(cb);
	          break;
	        case GET_MASK:
	          this.getMask();
	          break;
	        case GET_DATA:
	          this.getData(cb);
	          break;
	        case INFLATING:
	        case DEFER_EVENT:
	          this._loop = false;
	          return;
	      }
	    } while (this._loop);

	    if (!this._errored) cb();
	  }

	  /**
	   * Reads the first two bytes of a frame.
	   *
	   * @param {Function} cb Callback
	   * @private
	   */
	  getInfo(cb) {
	    if (this._bufferedBytes < 2) {
	      this._loop = false;
	      return;
	    }

	    const buf = this.consume(2);

	    if ((buf[0] & 0x30) !== 0x00) {
	      const error = this.createError(
	        RangeError,
	        'RSV2 and RSV3 must be clear',
	        true,
	        1002,
	        'WS_ERR_UNEXPECTED_RSV_2_3'
	      );

	      cb(error);
	      return;
	    }

	    const compressed = (buf[0] & 0x40) === 0x40;

	    if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
	      const error = this.createError(
	        RangeError,
	        'RSV1 must be clear',
	        true,
	        1002,
	        'WS_ERR_UNEXPECTED_RSV_1'
	      );

	      cb(error);
	      return;
	    }

	    this._fin = (buf[0] & 0x80) === 0x80;
	    this._opcode = buf[0] & 0x0f;
	    this._payloadLength = buf[1] & 0x7f;

	    if (this._opcode === 0x00) {
	      if (compressed) {
	        const error = this.createError(
	          RangeError,
	          'RSV1 must be clear',
	          true,
	          1002,
	          'WS_ERR_UNEXPECTED_RSV_1'
	        );

	        cb(error);
	        return;
	      }

	      if (!this._fragmented) {
	        const error = this.createError(
	          RangeError,
	          'invalid opcode 0',
	          true,
	          1002,
	          'WS_ERR_INVALID_OPCODE'
	        );

	        cb(error);
	        return;
	      }

	      this._opcode = this._fragmented;
	    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
	      if (this._fragmented) {
	        const error = this.createError(
	          RangeError,
	          `invalid opcode ${this._opcode}`,
	          true,
	          1002,
	          'WS_ERR_INVALID_OPCODE'
	        );

	        cb(error);
	        return;
	      }

	      this._compressed = compressed;
	    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
	      if (!this._fin) {
	        const error = this.createError(
	          RangeError,
	          'FIN must be set',
	          true,
	          1002,
	          'WS_ERR_EXPECTED_FIN'
	        );

	        cb(error);
	        return;
	      }

	      if (compressed) {
	        const error = this.createError(
	          RangeError,
	          'RSV1 must be clear',
	          true,
	          1002,
	          'WS_ERR_UNEXPECTED_RSV_1'
	        );

	        cb(error);
	        return;
	      }

	      if (
	        this._payloadLength > 0x7d ||
	        (this._opcode === 0x08 && this._payloadLength === 1)
	      ) {
	        const error = this.createError(
	          RangeError,
	          `invalid payload length ${this._payloadLength}`,
	          true,
	          1002,
	          'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
	        );

	        cb(error);
	        return;
	      }
	    } else {
	      const error = this.createError(
	        RangeError,
	        `invalid opcode ${this._opcode}`,
	        true,
	        1002,
	        'WS_ERR_INVALID_OPCODE'
	      );

	      cb(error);
	      return;
	    }

	    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
	    this._masked = (buf[1] & 0x80) === 0x80;

	    if (this._isServer) {
	      if (!this._masked) {
	        const error = this.createError(
	          RangeError,
	          'MASK must be set',
	          true,
	          1002,
	          'WS_ERR_EXPECTED_MASK'
	        );

	        cb(error);
	        return;
	      }
	    } else if (this._masked) {
	      const error = this.createError(
	        RangeError,
	        'MASK must be clear',
	        true,
	        1002,
	        'WS_ERR_UNEXPECTED_MASK'
	      );

	      cb(error);
	      return;
	    }

	    if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
	    else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
	    else this.haveLength(cb);
	  }

	  /**
	   * Gets extended payload length (7+16).
	   *
	   * @param {Function} cb Callback
	   * @private
	   */
	  getPayloadLength16(cb) {
	    if (this._bufferedBytes < 2) {
	      this._loop = false;
	      return;
	    }

	    this._payloadLength = this.consume(2).readUInt16BE(0);
	    this.haveLength(cb);
	  }

	  /**
	   * Gets extended payload length (7+64).
	   *
	   * @param {Function} cb Callback
	   * @private
	   */
	  getPayloadLength64(cb) {
	    if (this._bufferedBytes < 8) {
	      this._loop = false;
	      return;
	    }

	    const buf = this.consume(8);
	    const num = buf.readUInt32BE(0);

	    //
	    // The maximum safe integer in JavaScript is 2^53 - 1. An error is returned
	    // if payload length is greater than this number.
	    //
	    if (num > Math.pow(2, 53 - 32) - 1) {
	      const error = this.createError(
	        RangeError,
	        'Unsupported WebSocket frame: payload length > 2^53 - 1',
	        false,
	        1009,
	        'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'
	      );

	      cb(error);
	      return;
	    }

	    this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
	    this.haveLength(cb);
	  }

	  /**
	   * Payload length has been read.
	   *
	   * @param {Function} cb Callback
	   * @private
	   */
	  haveLength(cb) {
	    if (this._payloadLength && this._opcode < 0x08) {
	      this._totalPayloadLength += this._payloadLength;
	      if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
	        const error = this.createError(
	          RangeError,
	          'Max payload size exceeded',
	          false,
	          1009,
	          'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
	        );

	        cb(error);
	        return;
	      }
	    }

	    if (this._masked) this._state = GET_MASK;
	    else this._state = GET_DATA;
	  }

	  /**
	   * Reads mask bytes.
	   *
	   * @private
	   */
	  getMask() {
	    if (this._bufferedBytes < 4) {
	      this._loop = false;
	      return;
	    }

	    this._mask = this.consume(4);
	    this._state = GET_DATA;
	  }

	  /**
	   * Reads data bytes.
	   *
	   * @param {Function} cb Callback
	   * @private
	   */
	  getData(cb) {
	    let data = EMPTY_BUFFER;

	    if (this._payloadLength) {
	      if (this._bufferedBytes < this._payloadLength) {
	        this._loop = false;
	        return;
	      }

	      data = this.consume(this._payloadLength);

	      if (
	        this._masked &&
	        (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0
	      ) {
	        unmask(data, this._mask);
	      }
	    }

	    if (this._opcode > 0x07) {
	      this.controlMessage(data, cb);
	      return;
	    }

	    if (this._compressed) {
	      this._state = INFLATING;
	      this.decompress(data, cb);
	      return;
	    }

	    if (data.length) {
	      //
	      // This message is not compressed so its length is the sum of the payload
	      // length of all fragments.
	      //
	      this._messageLength = this._totalPayloadLength;
	      this._fragments.push(data);
	    }

	    this.dataMessage(cb);
	  }

	  /**
	   * Decompresses data.
	   *
	   * @param {Buffer} data Compressed data
	   * @param {Function} cb Callback
	   * @private
	   */
	  decompress(data, cb) {
	    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

	    perMessageDeflate.decompress(data, this._fin, (err, buf) => {
	      if (err) return cb(err);

	      if (buf.length) {
	        this._messageLength += buf.length;
	        if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
	          const error = this.createError(
	            RangeError,
	            'Max payload size exceeded',
	            false,
	            1009,
	            'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
	          );

	          cb(error);
	          return;
	        }

	        this._fragments.push(buf);
	      }

	      this.dataMessage(cb);
	      if (this._state === GET_INFO) this.startLoop(cb);
	    });
	  }

	  /**
	   * Handles a data message.
	   *
	   * @param {Function} cb Callback
	   * @private
	   */
	  dataMessage(cb) {
	    if (!this._fin) {
	      this._state = GET_INFO;
	      return;
	    }

	    const messageLength = this._messageLength;
	    const fragments = this._fragments;

	    this._totalPayloadLength = 0;
	    this._messageLength = 0;
	    this._fragmented = 0;
	    this._fragments = [];

	    if (this._opcode === 2) {
	      let data;

	      if (this._binaryType === 'nodebuffer') {
	        data = concat(fragments, messageLength);
	      } else if (this._binaryType === 'arraybuffer') {
	        data = toArrayBuffer(concat(fragments, messageLength));
	      } else if (this._binaryType === 'blob') {
	        data = new Blob(fragments);
	      } else {
	        data = fragments;
	      }

	      if (this._allowSynchronousEvents) {
	        this.emit('message', data, true);
	        this._state = GET_INFO;
	      } else {
	        this._state = DEFER_EVENT;
	        setImmediate(() => {
	          this.emit('message', data, true);
	          this._state = GET_INFO;
	          this.startLoop(cb);
	        });
	      }
	    } else {
	      const buf = concat(fragments, messageLength);

	      if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
	        const error = this.createError(
	          Error,
	          'invalid UTF-8 sequence',
	          true,
	          1007,
	          'WS_ERR_INVALID_UTF8'
	        );

	        cb(error);
	        return;
	      }

	      if (this._state === INFLATING || this._allowSynchronousEvents) {
	        this.emit('message', buf, false);
	        this._state = GET_INFO;
	      } else {
	        this._state = DEFER_EVENT;
	        setImmediate(() => {
	          this.emit('message', buf, false);
	          this._state = GET_INFO;
	          this.startLoop(cb);
	        });
	      }
	    }
	  }

	  /**
	   * Handles a control message.
	   *
	   * @param {Buffer} data Data to handle
	   * @return {(Error|RangeError|undefined)} A possible error
	   * @private
	   */
	  controlMessage(data, cb) {
	    if (this._opcode === 0x08) {
	      if (data.length === 0) {
	        this._loop = false;
	        this.emit('conclude', 1005, EMPTY_BUFFER);
	        this.end();
	      } else {
	        const code = data.readUInt16BE(0);

	        if (!isValidStatusCode(code)) {
	          const error = this.createError(
	            RangeError,
	            `invalid status code ${code}`,
	            true,
	            1002,
	            'WS_ERR_INVALID_CLOSE_CODE'
	          );

	          cb(error);
	          return;
	        }

	        const buf = new FastBuffer(
	          data.buffer,
	          data.byteOffset + 2,
	          data.length - 2
	        );

	        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
	          const error = this.createError(
	            Error,
	            'invalid UTF-8 sequence',
	            true,
	            1007,
	            'WS_ERR_INVALID_UTF8'
	          );

	          cb(error);
	          return;
	        }

	        this._loop = false;
	        this.emit('conclude', code, buf);
	        this.end();
	      }

	      this._state = GET_INFO;
	      return;
	    }

	    if (this._allowSynchronousEvents) {
	      this.emit(this._opcode === 0x09 ? 'ping' : 'pong', data);
	      this._state = GET_INFO;
	    } else {
	      this._state = DEFER_EVENT;
	      setImmediate(() => {
	        this.emit(this._opcode === 0x09 ? 'ping' : 'pong', data);
	        this._state = GET_INFO;
	        this.startLoop(cb);
	      });
	    }
	  }

	  /**
	   * Builds an error object.
	   *
	   * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
	   * @param {String} message The error message
	   * @param {Boolean} prefix Specifies whether or not to add a default prefix to
	   *     `message`
	   * @param {Number} statusCode The status code
	   * @param {String} errorCode The exposed error code
	   * @return {(Error|RangeError)} The error
	   * @private
	   */
	  createError(ErrorCtor, message, prefix, statusCode, errorCode) {
	    this._loop = false;
	    this._errored = true;

	    const err = new ErrorCtor(
	      prefix ? `Invalid WebSocket frame: ${message}` : message
	    );

	    Error.captureStackTrace(err, this.createError);
	    err.code = errorCode;
	    err[kStatusCode] = statusCode;
	    return err;
	  }
	}

	receiver = Receiver;
	return receiver;
}

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Duplex" }] */

var sender;
var hasRequiredSender;

function requireSender () {
	if (hasRequiredSender) return sender;
	hasRequiredSender = 1;

	const { Duplex } = require$$1;
	const { randomFillSync } = require$$1$1;

	const PerMessageDeflate = requirePermessageDeflate();
	const { EMPTY_BUFFER, kWebSocket, NOOP } = requireConstants$1();
	const { isBlob, isValidStatusCode } = requireValidation();
	const { mask: applyMask, toBuffer } = requireBufferUtil();

	const kByteLength = Symbol('kByteLength');
	const maskBuffer = Buffer.alloc(4);
	const RANDOM_POOL_SIZE = 8 * 1024;
	let randomPool;
	let randomPoolPointer = RANDOM_POOL_SIZE;

	const DEFAULT = 0;
	const DEFLATING = 1;
	const GET_BLOB_DATA = 2;

	/**
	 * HyBi Sender implementation.
	 */
	class Sender {
	  /**
	   * Creates a Sender instance.
	   *
	   * @param {Duplex} socket The connection socket
	   * @param {Object} [extensions] An object containing the negotiated extensions
	   * @param {Function} [generateMask] The function used to generate the masking
	   *     key
	   */
	  constructor(socket, extensions, generateMask) {
	    this._extensions = extensions || {};

	    if (generateMask) {
	      this._generateMask = generateMask;
	      this._maskBuffer = Buffer.alloc(4);
	    }

	    this._socket = socket;

	    this._firstFragment = true;
	    this._compress = false;

	    this._bufferedBytes = 0;
	    this._queue = [];
	    this._state = DEFAULT;
	    this.onerror = NOOP;
	    this[kWebSocket] = undefined;
	  }

	  /**
	   * Frames a piece of data according to the HyBi WebSocket protocol.
	   *
	   * @param {(Buffer|String)} data The data to frame
	   * @param {Object} options Options object
	   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
	   *     FIN bit
	   * @param {Function} [options.generateMask] The function used to generate the
	   *     masking key
	   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
	   *     `data`
	   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
	   *     key
	   * @param {Number} options.opcode The opcode
	   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
	   *     modified
	   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
	   *     RSV1 bit
	   * @return {(Buffer|String)[]} The framed data
	   * @public
	   */
	  static frame(data, options) {
	    let mask;
	    let merge = false;
	    let offset = 2;
	    let skipMasking = false;

	    if (options.mask) {
	      mask = options.maskBuffer || maskBuffer;

	      if (options.generateMask) {
	        options.generateMask(mask);
	      } else {
	        if (randomPoolPointer === RANDOM_POOL_SIZE) {
	          /* istanbul ignore else  */
	          if (randomPool === undefined) {
	            //
	            // This is lazily initialized because server-sent frames must not
	            // be masked so it may never be used.
	            //
	            randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
	          }

	          randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
	          randomPoolPointer = 0;
	        }

	        mask[0] = randomPool[randomPoolPointer++];
	        mask[1] = randomPool[randomPoolPointer++];
	        mask[2] = randomPool[randomPoolPointer++];
	        mask[3] = randomPool[randomPoolPointer++];
	      }

	      skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
	      offset = 6;
	    }

	    let dataLength;

	    if (typeof data === 'string') {
	      if (
	        (!options.mask || skipMasking) &&
	        options[kByteLength] !== undefined
	      ) {
	        dataLength = options[kByteLength];
	      } else {
	        data = Buffer.from(data);
	        dataLength = data.length;
	      }
	    } else {
	      dataLength = data.length;
	      merge = options.mask && options.readOnly && !skipMasking;
	    }

	    let payloadLength = dataLength;

	    if (dataLength >= 65536) {
	      offset += 8;
	      payloadLength = 127;
	    } else if (dataLength > 125) {
	      offset += 2;
	      payloadLength = 126;
	    }

	    const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);

	    target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
	    if (options.rsv1) target[0] |= 0x40;

	    target[1] = payloadLength;

	    if (payloadLength === 126) {
	      target.writeUInt16BE(dataLength, 2);
	    } else if (payloadLength === 127) {
	      target[2] = target[3] = 0;
	      target.writeUIntBE(dataLength, 4, 6);
	    }

	    if (!options.mask) return [target, data];

	    target[1] |= 0x80;
	    target[offset - 4] = mask[0];
	    target[offset - 3] = mask[1];
	    target[offset - 2] = mask[2];
	    target[offset - 1] = mask[3];

	    if (skipMasking) return [target, data];

	    if (merge) {
	      applyMask(data, mask, target, offset, dataLength);
	      return [target];
	    }

	    applyMask(data, mask, data, 0, dataLength);
	    return [target, data];
	  }

	  /**
	   * Sends a close message to the other peer.
	   *
	   * @param {Number} [code] The status code component of the body
	   * @param {(String|Buffer)} [data] The message component of the body
	   * @param {Boolean} [mask=false] Specifies whether or not to mask the message
	   * @param {Function} [cb] Callback
	   * @public
	   */
	  close(code, data, mask, cb) {
	    let buf;

	    if (code === undefined) {
	      buf = EMPTY_BUFFER;
	    } else if (typeof code !== 'number' || !isValidStatusCode(code)) {
	      throw new TypeError('First argument must be a valid error code number');
	    } else if (data === undefined || !data.length) {
	      buf = Buffer.allocUnsafe(2);
	      buf.writeUInt16BE(code, 0);
	    } else {
	      const length = Buffer.byteLength(data);

	      if (length > 123) {
	        throw new RangeError('The message must not be greater than 123 bytes');
	      }

	      buf = Buffer.allocUnsafe(2 + length);
	      buf.writeUInt16BE(code, 0);

	      if (typeof data === 'string') {
	        buf.write(data, 2);
	      } else {
	        buf.set(data, 2);
	      }
	    }

	    const options = {
	      [kByteLength]: buf.length,
	      fin: true,
	      generateMask: this._generateMask,
	      mask,
	      maskBuffer: this._maskBuffer,
	      opcode: 0x08,
	      readOnly: false,
	      rsv1: false
	    };

	    if (this._state !== DEFAULT) {
	      this.enqueue([this.dispatch, buf, false, options, cb]);
	    } else {
	      this.sendFrame(Sender.frame(buf, options), cb);
	    }
	  }

	  /**
	   * Sends a ping message to the other peer.
	   *
	   * @param {*} data The message to send
	   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
	   * @param {Function} [cb] Callback
	   * @public
	   */
	  ping(data, mask, cb) {
	    let byteLength;
	    let readOnly;

	    if (typeof data === 'string') {
	      byteLength = Buffer.byteLength(data);
	      readOnly = false;
	    } else if (isBlob(data)) {
	      byteLength = data.size;
	      readOnly = false;
	    } else {
	      data = toBuffer(data);
	      byteLength = data.length;
	      readOnly = toBuffer.readOnly;
	    }

	    if (byteLength > 125) {
	      throw new RangeError('The data size must not be greater than 125 bytes');
	    }

	    const options = {
	      [kByteLength]: byteLength,
	      fin: true,
	      generateMask: this._generateMask,
	      mask,
	      maskBuffer: this._maskBuffer,
	      opcode: 0x09,
	      readOnly,
	      rsv1: false
	    };

	    if (isBlob(data)) {
	      if (this._state !== DEFAULT) {
	        this.enqueue([this.getBlobData, data, false, options, cb]);
	      } else {
	        this.getBlobData(data, false, options, cb);
	      }
	    } else if (this._state !== DEFAULT) {
	      this.enqueue([this.dispatch, data, false, options, cb]);
	    } else {
	      this.sendFrame(Sender.frame(data, options), cb);
	    }
	  }

	  /**
	   * Sends a pong message to the other peer.
	   *
	   * @param {*} data The message to send
	   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
	   * @param {Function} [cb] Callback
	   * @public
	   */
	  pong(data, mask, cb) {
	    let byteLength;
	    let readOnly;

	    if (typeof data === 'string') {
	      byteLength = Buffer.byteLength(data);
	      readOnly = false;
	    } else if (isBlob(data)) {
	      byteLength = data.size;
	      readOnly = false;
	    } else {
	      data = toBuffer(data);
	      byteLength = data.length;
	      readOnly = toBuffer.readOnly;
	    }

	    if (byteLength > 125) {
	      throw new RangeError('The data size must not be greater than 125 bytes');
	    }

	    const options = {
	      [kByteLength]: byteLength,
	      fin: true,
	      generateMask: this._generateMask,
	      mask,
	      maskBuffer: this._maskBuffer,
	      opcode: 0x0a,
	      readOnly,
	      rsv1: false
	    };

	    if (isBlob(data)) {
	      if (this._state !== DEFAULT) {
	        this.enqueue([this.getBlobData, data, false, options, cb]);
	      } else {
	        this.getBlobData(data, false, options, cb);
	      }
	    } else if (this._state !== DEFAULT) {
	      this.enqueue([this.dispatch, data, false, options, cb]);
	    } else {
	      this.sendFrame(Sender.frame(data, options), cb);
	    }
	  }

	  /**
	   * Sends a data message to the other peer.
	   *
	   * @param {*} data The message to send
	   * @param {Object} options Options object
	   * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
	   *     or text
	   * @param {Boolean} [options.compress=false] Specifies whether or not to
	   *     compress `data`
	   * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
	   *     last one
	   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
	   *     `data`
	   * @param {Function} [cb] Callback
	   * @public
	   */
	  send(data, options, cb) {
	    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
	    let opcode = options.binary ? 2 : 1;
	    let rsv1 = options.compress;

	    let byteLength;
	    let readOnly;

	    if (typeof data === 'string') {
	      byteLength = Buffer.byteLength(data);
	      readOnly = false;
	    } else if (isBlob(data)) {
	      byteLength = data.size;
	      readOnly = false;
	    } else {
	      data = toBuffer(data);
	      byteLength = data.length;
	      readOnly = toBuffer.readOnly;
	    }

	    if (this._firstFragment) {
	      this._firstFragment = false;
	      if (
	        rsv1 &&
	        perMessageDeflate &&
	        perMessageDeflate.params[
	          perMessageDeflate._isServer
	            ? 'server_no_context_takeover'
	            : 'client_no_context_takeover'
	        ]
	      ) {
	        rsv1 = byteLength >= perMessageDeflate._threshold;
	      }
	      this._compress = rsv1;
	    } else {
	      rsv1 = false;
	      opcode = 0;
	    }

	    if (options.fin) this._firstFragment = true;

	    const opts = {
	      [kByteLength]: byteLength,
	      fin: options.fin,
	      generateMask: this._generateMask,
	      mask: options.mask,
	      maskBuffer: this._maskBuffer,
	      opcode,
	      readOnly,
	      rsv1
	    };

	    if (isBlob(data)) {
	      if (this._state !== DEFAULT) {
	        this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
	      } else {
	        this.getBlobData(data, this._compress, opts, cb);
	      }
	    } else if (this._state !== DEFAULT) {
	      this.enqueue([this.dispatch, data, this._compress, opts, cb]);
	    } else {
	      this.dispatch(data, this._compress, opts, cb);
	    }
	  }

	  /**
	   * Gets the contents of a blob as binary data.
	   *
	   * @param {Blob} blob The blob
	   * @param {Boolean} [compress=false] Specifies whether or not to compress
	   *     the data
	   * @param {Object} options Options object
	   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
	   *     FIN bit
	   * @param {Function} [options.generateMask] The function used to generate the
	   *     masking key
	   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
	   *     `data`
	   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
	   *     key
	   * @param {Number} options.opcode The opcode
	   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
	   *     modified
	   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
	   *     RSV1 bit
	   * @param {Function} [cb] Callback
	   * @private
	   */
	  getBlobData(blob, compress, options, cb) {
	    this._bufferedBytes += options[kByteLength];
	    this._state = GET_BLOB_DATA;

	    blob
	      .arrayBuffer()
	      .then((arrayBuffer) => {
	        if (this._socket.destroyed) {
	          const err = new Error(
	            'The socket was closed while the blob was being read'
	          );

	          //
	          // `callCallbacks` is called in the next tick to ensure that errors
	          // that might be thrown in the callbacks behave like errors thrown
	          // outside the promise chain.
	          //
	          process.nextTick(callCallbacks, this, err, cb);
	          return;
	        }

	        this._bufferedBytes -= options[kByteLength];
	        const data = toBuffer(arrayBuffer);

	        if (!compress) {
	          this._state = DEFAULT;
	          this.sendFrame(Sender.frame(data, options), cb);
	          this.dequeue();
	        } else {
	          this.dispatch(data, compress, options, cb);
	        }
	      })
	      .catch((err) => {
	        //
	        // `onError` is called in the next tick for the same reason that
	        // `callCallbacks` above is.
	        //
	        process.nextTick(onError, this, err, cb);
	      });
	  }

	  /**
	   * Dispatches a message.
	   *
	   * @param {(Buffer|String)} data The message to send
	   * @param {Boolean} [compress=false] Specifies whether or not to compress
	   *     `data`
	   * @param {Object} options Options object
	   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
	   *     FIN bit
	   * @param {Function} [options.generateMask] The function used to generate the
	   *     masking key
	   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
	   *     `data`
	   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
	   *     key
	   * @param {Number} options.opcode The opcode
	   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
	   *     modified
	   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
	   *     RSV1 bit
	   * @param {Function} [cb] Callback
	   * @private
	   */
	  dispatch(data, compress, options, cb) {
	    if (!compress) {
	      this.sendFrame(Sender.frame(data, options), cb);
	      return;
	    }

	    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

	    this._bufferedBytes += options[kByteLength];
	    this._state = DEFLATING;
	    perMessageDeflate.compress(data, options.fin, (_, buf) => {
	      if (this._socket.destroyed) {
	        const err = new Error(
	          'The socket was closed while data was being compressed'
	        );

	        callCallbacks(this, err, cb);
	        return;
	      }

	      this._bufferedBytes -= options[kByteLength];
	      this._state = DEFAULT;
	      options.readOnly = false;
	      this.sendFrame(Sender.frame(buf, options), cb);
	      this.dequeue();
	    });
	  }

	  /**
	   * Executes queued send operations.
	   *
	   * @private
	   */
	  dequeue() {
	    while (this._state === DEFAULT && this._queue.length) {
	      const params = this._queue.shift();

	      this._bufferedBytes -= params[3][kByteLength];
	      Reflect.apply(params[0], this, params.slice(1));
	    }
	  }

	  /**
	   * Enqueues a send operation.
	   *
	   * @param {Array} params Send operation parameters.
	   * @private
	   */
	  enqueue(params) {
	    this._bufferedBytes += params[3][kByteLength];
	    this._queue.push(params);
	  }

	  /**
	   * Sends a frame.
	   *
	   * @param {(Buffer | String)[]} list The frame to send
	   * @param {Function} [cb] Callback
	   * @private
	   */
	  sendFrame(list, cb) {
	    if (list.length === 2) {
	      this._socket.cork();
	      this._socket.write(list[0]);
	      this._socket.write(list[1], cb);
	      this._socket.uncork();
	    } else {
	      this._socket.write(list[0], cb);
	    }
	  }
	}

	sender = Sender;

	/**
	 * Calls queued callbacks with an error.
	 *
	 * @param {Sender} sender The `Sender` instance
	 * @param {Error} err The error to call the callbacks with
	 * @param {Function} [cb] The first callback
	 * @private
	 */
	function callCallbacks(sender, err, cb) {
	  if (typeof cb === 'function') cb(err);

	  for (let i = 0; i < sender._queue.length; i++) {
	    const params = sender._queue[i];
	    const callback = params[params.length - 1];

	    if (typeof callback === 'function') callback(err);
	  }
	}

	/**
	 * Handles a `Sender` error.
	 *
	 * @param {Sender} sender The `Sender` instance
	 * @param {Error} err The error
	 * @param {Function} [cb] The first pending callback
	 * @private
	 */
	function onError(sender, err, cb) {
	  callCallbacks(sender, err, cb);
	  sender.onerror(err);
	}
	return sender;
}

var eventTarget;
var hasRequiredEventTarget;

function requireEventTarget () {
	if (hasRequiredEventTarget) return eventTarget;
	hasRequiredEventTarget = 1;

	const { kForOnEventAttribute, kListener } = requireConstants$1();

	const kCode = Symbol('kCode');
	const kData = Symbol('kData');
	const kError = Symbol('kError');
	const kMessage = Symbol('kMessage');
	const kReason = Symbol('kReason');
	const kTarget = Symbol('kTarget');
	const kType = Symbol('kType');
	const kWasClean = Symbol('kWasClean');

	/**
	 * Class representing an event.
	 */
	class Event {
	  /**
	   * Create a new `Event`.
	   *
	   * @param {String} type The name of the event
	   * @throws {TypeError} If the `type` argument is not specified
	   */
	  constructor(type) {
	    this[kTarget] = null;
	    this[kType] = type;
	  }

	  /**
	   * @type {*}
	   */
	  get target() {
	    return this[kTarget];
	  }

	  /**
	   * @type {String}
	   */
	  get type() {
	    return this[kType];
	  }
	}

	Object.defineProperty(Event.prototype, 'target', { enumerable: true });
	Object.defineProperty(Event.prototype, 'type', { enumerable: true });

	/**
	 * Class representing a close event.
	 *
	 * @extends Event
	 */
	class CloseEvent extends Event {
	  /**
	   * Create a new `CloseEvent`.
	   *
	   * @param {String} type The name of the event
	   * @param {Object} [options] A dictionary object that allows for setting
	   *     attributes via object members of the same name
	   * @param {Number} [options.code=0] The status code explaining why the
	   *     connection was closed
	   * @param {String} [options.reason=''] A human-readable string explaining why
	   *     the connection was closed
	   * @param {Boolean} [options.wasClean=false] Indicates whether or not the
	   *     connection was cleanly closed
	   */
	  constructor(type, options = {}) {
	    super(type);

	    this[kCode] = options.code === undefined ? 0 : options.code;
	    this[kReason] = options.reason === undefined ? '' : options.reason;
	    this[kWasClean] = options.wasClean === undefined ? false : options.wasClean;
	  }

	  /**
	   * @type {Number}
	   */
	  get code() {
	    return this[kCode];
	  }

	  /**
	   * @type {String}
	   */
	  get reason() {
	    return this[kReason];
	  }

	  /**
	   * @type {Boolean}
	   */
	  get wasClean() {
	    return this[kWasClean];
	  }
	}

	Object.defineProperty(CloseEvent.prototype, 'code', { enumerable: true });
	Object.defineProperty(CloseEvent.prototype, 'reason', { enumerable: true });
	Object.defineProperty(CloseEvent.prototype, 'wasClean', { enumerable: true });

	/**
	 * Class representing an error event.
	 *
	 * @extends Event
	 */
	class ErrorEvent extends Event {
	  /**
	   * Create a new `ErrorEvent`.
	   *
	   * @param {String} type The name of the event
	   * @param {Object} [options] A dictionary object that allows for setting
	   *     attributes via object members of the same name
	   * @param {*} [options.error=null] The error that generated this event
	   * @param {String} [options.message=''] The error message
	   */
	  constructor(type, options = {}) {
	    super(type);

	    this[kError] = options.error === undefined ? null : options.error;
	    this[kMessage] = options.message === undefined ? '' : options.message;
	  }

	  /**
	   * @type {*}
	   */
	  get error() {
	    return this[kError];
	  }

	  /**
	   * @type {String}
	   */
	  get message() {
	    return this[kMessage];
	  }
	}

	Object.defineProperty(ErrorEvent.prototype, 'error', { enumerable: true });
	Object.defineProperty(ErrorEvent.prototype, 'message', { enumerable: true });

	/**
	 * Class representing a message event.
	 *
	 * @extends Event
	 */
	class MessageEvent extends Event {
	  /**
	   * Create a new `MessageEvent`.
	   *
	   * @param {String} type The name of the event
	   * @param {Object} [options] A dictionary object that allows for setting
	   *     attributes via object members of the same name
	   * @param {*} [options.data=null] The message content
	   */
	  constructor(type, options = {}) {
	    super(type);

	    this[kData] = options.data === undefined ? null : options.data;
	  }

	  /**
	   * @type {*}
	   */
	  get data() {
	    return this[kData];
	  }
	}

	Object.defineProperty(MessageEvent.prototype, 'data', { enumerable: true });

	/**
	 * This provides methods for emulating the `EventTarget` interface. It's not
	 * meant to be used directly.
	 *
	 * @mixin
	 */
	const EventTarget = {
	  /**
	   * Register an event listener.
	   *
	   * @param {String} type A string representing the event type to listen for
	   * @param {(Function|Object)} handler The listener to add
	   * @param {Object} [options] An options object specifies characteristics about
	   *     the event listener
	   * @param {Boolean} [options.once=false] A `Boolean` indicating that the
	   *     listener should be invoked at most once after being added. If `true`,
	   *     the listener would be automatically removed when invoked.
	   * @public
	   */
	  addEventListener(type, handler, options = {}) {
	    for (const listener of this.listeners(type)) {
	      if (
	        !options[kForOnEventAttribute] &&
	        listener[kListener] === handler &&
	        !listener[kForOnEventAttribute]
	      ) {
	        return;
	      }
	    }

	    let wrapper;

	    if (type === 'message') {
	      wrapper = function onMessage(data, isBinary) {
	        const event = new MessageEvent('message', {
	          data: isBinary ? data : data.toString()
	        });

	        event[kTarget] = this;
	        callListener(handler, this, event);
	      };
	    } else if (type === 'close') {
	      wrapper = function onClose(code, message) {
	        const event = new CloseEvent('close', {
	          code,
	          reason: message.toString(),
	          wasClean: this._closeFrameReceived && this._closeFrameSent
	        });

	        event[kTarget] = this;
	        callListener(handler, this, event);
	      };
	    } else if (type === 'error') {
	      wrapper = function onError(error) {
	        const event = new ErrorEvent('error', {
	          error,
	          message: error.message
	        });

	        event[kTarget] = this;
	        callListener(handler, this, event);
	      };
	    } else if (type === 'open') {
	      wrapper = function onOpen() {
	        const event = new Event('open');

	        event[kTarget] = this;
	        callListener(handler, this, event);
	      };
	    } else {
	      return;
	    }

	    wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
	    wrapper[kListener] = handler;

	    if (options.once) {
	      this.once(type, wrapper);
	    } else {
	      this.on(type, wrapper);
	    }
	  },

	  /**
	   * Remove an event listener.
	   *
	   * @param {String} type A string representing the event type to remove
	   * @param {(Function|Object)} handler The listener to remove
	   * @public
	   */
	  removeEventListener(type, handler) {
	    for (const listener of this.listeners(type)) {
	      if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
	        this.removeListener(type, listener);
	        break;
	      }
	    }
	  }
	};

	eventTarget = {
	  CloseEvent,
	  ErrorEvent,
	  Event,
	  EventTarget,
	  MessageEvent
	};

	/**
	 * Call an event listener
	 *
	 * @param {(Function|Object)} listener The listener to call
	 * @param {*} thisArg The value to use as `this`` when calling the listener
	 * @param {Event} event The event to pass to the listener
	 * @private
	 */
	function callListener(listener, thisArg, event) {
	  if (typeof listener === 'object' && listener.handleEvent) {
	    listener.handleEvent.call(listener, event);
	  } else {
	    listener.call(thisArg, event);
	  }
	}
	return eventTarget;
}

var extension;
var hasRequiredExtension;

function requireExtension () {
	if (hasRequiredExtension) return extension;
	hasRequiredExtension = 1;

	const { tokenChars } = requireValidation();

	/**
	 * Adds an offer to the map of extension offers or a parameter to the map of
	 * parameters.
	 *
	 * @param {Object} dest The map of extension offers or parameters
	 * @param {String} name The extension or parameter name
	 * @param {(Object|Boolean|String)} elem The extension parameters or the
	 *     parameter value
	 * @private
	 */
	function push(dest, name, elem) {
	  if (dest[name] === undefined) dest[name] = [elem];
	  else dest[name].push(elem);
	}

	/**
	 * Parses the `Sec-WebSocket-Extensions` header into an object.
	 *
	 * @param {String} header The field value of the header
	 * @return {Object} The parsed object
	 * @public
	 */
	function parse(header) {
	  const offers = Object.create(null);
	  let params = Object.create(null);
	  let mustUnescape = false;
	  let isEscaping = false;
	  let inQuotes = false;
	  let extensionName;
	  let paramName;
	  let start = -1;
	  let code = -1;
	  let end = -1;
	  let i = 0;

	  for (; i < header.length; i++) {
	    code = header.charCodeAt(i);

	    if (extensionName === undefined) {
	      if (end === -1 && tokenChars[code] === 1) {
	        if (start === -1) start = i;
	      } else if (
	        i !== 0 &&
	        (code === 0x20 /* ' ' */ || code === 0x09) /* '\t' */
	      ) {
	        if (end === -1 && start !== -1) end = i;
	      } else if (code === 0x3b /* ';' */ || code === 0x2c /* ',' */) {
	        if (start === -1) {
	          throw new SyntaxError(`Unexpected character at index ${i}`);
	        }

	        if (end === -1) end = i;
	        const name = header.slice(start, end);
	        if (code === 0x2c) {
	          push(offers, name, params);
	          params = Object.create(null);
	        } else {
	          extensionName = name;
	        }

	        start = end = -1;
	      } else {
	        throw new SyntaxError(`Unexpected character at index ${i}`);
	      }
	    } else if (paramName === undefined) {
	      if (end === -1 && tokenChars[code] === 1) {
	        if (start === -1) start = i;
	      } else if (code === 0x20 || code === 0x09) {
	        if (end === -1 && start !== -1) end = i;
	      } else if (code === 0x3b || code === 0x2c) {
	        if (start === -1) {
	          throw new SyntaxError(`Unexpected character at index ${i}`);
	        }

	        if (end === -1) end = i;
	        push(params, header.slice(start, end), true);
	        if (code === 0x2c) {
	          push(offers, extensionName, params);
	          params = Object.create(null);
	          extensionName = undefined;
	        }

	        start = end = -1;
	      } else if (code === 0x3d /* '=' */ && start !== -1 && end === -1) {
	        paramName = header.slice(start, i);
	        start = end = -1;
	      } else {
	        throw new SyntaxError(`Unexpected character at index ${i}`);
	      }
	    } else {
	      //
	      // The value of a quoted-string after unescaping must conform to the
	      // token ABNF, so only token characters are valid.
	      // Ref: https://tools.ietf.org/html/rfc6455#section-9.1
	      //
	      if (isEscaping) {
	        if (tokenChars[code] !== 1) {
	          throw new SyntaxError(`Unexpected character at index ${i}`);
	        }
	        if (start === -1) start = i;
	        else if (!mustUnescape) mustUnescape = true;
	        isEscaping = false;
	      } else if (inQuotes) {
	        if (tokenChars[code] === 1) {
	          if (start === -1) start = i;
	        } else if (code === 0x22 /* '"' */ && start !== -1) {
	          inQuotes = false;
	          end = i;
	        } else if (code === 0x5c /* '\' */) {
	          isEscaping = true;
	        } else {
	          throw new SyntaxError(`Unexpected character at index ${i}`);
	        }
	      } else if (code === 0x22 && header.charCodeAt(i - 1) === 0x3d) {
	        inQuotes = true;
	      } else if (end === -1 && tokenChars[code] === 1) {
	        if (start === -1) start = i;
	      } else if (start !== -1 && (code === 0x20 || code === 0x09)) {
	        if (end === -1) end = i;
	      } else if (code === 0x3b || code === 0x2c) {
	        if (start === -1) {
	          throw new SyntaxError(`Unexpected character at index ${i}`);
	        }

	        if (end === -1) end = i;
	        let value = header.slice(start, end);
	        if (mustUnescape) {
	          value = value.replace(/\\/g, '');
	          mustUnescape = false;
	        }
	        push(params, paramName, value);
	        if (code === 0x2c) {
	          push(offers, extensionName, params);
	          params = Object.create(null);
	          extensionName = undefined;
	        }

	        paramName = undefined;
	        start = end = -1;
	      } else {
	        throw new SyntaxError(`Unexpected character at index ${i}`);
	      }
	    }
	  }

	  if (start === -1 || inQuotes || code === 0x20 || code === 0x09) {
	    throw new SyntaxError('Unexpected end of input');
	  }

	  if (end === -1) end = i;
	  const token = header.slice(start, end);
	  if (extensionName === undefined) {
	    push(offers, token, params);
	  } else {
	    if (paramName === undefined) {
	      push(params, token, true);
	    } else if (mustUnescape) {
	      push(params, paramName, token.replace(/\\/g, ''));
	    } else {
	      push(params, paramName, token);
	    }
	    push(offers, extensionName, params);
	  }

	  return offers;
	}

	/**
	 * Builds the `Sec-WebSocket-Extensions` header field value.
	 *
	 * @param {Object} extensions The map of extensions and parameters to format
	 * @return {String} A string representing the given object
	 * @public
	 */
	function format(extensions) {
	  return Object.keys(extensions)
	    .map((extension) => {
	      let configurations = extensions[extension];
	      if (!Array.isArray(configurations)) configurations = [configurations];
	      return configurations
	        .map((params) => {
	          return [extension]
	            .concat(
	              Object.keys(params).map((k) => {
	                let values = params[k];
	                if (!Array.isArray(values)) values = [values];
	                return values
	                  .map((v) => (v === true ? k : `${k}=${v}`))
	                  .join('; ');
	              })
	            )
	            .join('; ');
	        })
	        .join(', ');
	    })
	    .join(', ');
	}

	extension = { format, parse };
	return extension;
}

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Duplex|Readable$", "caughtErrors": "none" }] */

var websocket;
var hasRequiredWebsocket;

function requireWebsocket () {
	if (hasRequiredWebsocket) return websocket;
	hasRequiredWebsocket = 1;

	const EventEmitter = require$$0$2;
	const https = require$$1$2;
	const http = require$$2;
	const net = require$$3;
	const tls = require$$4;
	const { randomBytes, createHash } = require$$1$1;
	const { Duplex, Readable } = require$$1;
	const { URL } = require$$7;

	const PerMessageDeflate = requirePermessageDeflate();
	const Receiver = requireReceiver();
	const Sender = requireSender();
	const { isBlob } = requireValidation();

	const {
	  BINARY_TYPES,
	  EMPTY_BUFFER,
	  GUID,
	  kForOnEventAttribute,
	  kListener,
	  kStatusCode,
	  kWebSocket,
	  NOOP
	} = requireConstants$1();
	const {
	  EventTarget: { addEventListener, removeEventListener }
	} = requireEventTarget();
	const { format, parse } = requireExtension();
	const { toBuffer } = requireBufferUtil();

	const closeTimeout = 30 * 1000;
	const kAborted = Symbol('kAborted');
	const protocolVersions = [8, 13];
	const readyStates = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
	const subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;

	/**
	 * Class representing a WebSocket.
	 *
	 * @extends EventEmitter
	 */
	class WebSocket extends EventEmitter {
	  /**
	   * Create a new `WebSocket`.
	   *
	   * @param {(String|URL)} address The URL to which to connect
	   * @param {(String|String[])} [protocols] The subprotocols
	   * @param {Object} [options] Connection options
	   */
	  constructor(address, protocols, options) {
	    super();

	    this._binaryType = BINARY_TYPES[0];
	    this._closeCode = 1006;
	    this._closeFrameReceived = false;
	    this._closeFrameSent = false;
	    this._closeMessage = EMPTY_BUFFER;
	    this._closeTimer = null;
	    this._errorEmitted = false;
	    this._extensions = {};
	    this._paused = false;
	    this._protocol = '';
	    this._readyState = WebSocket.CONNECTING;
	    this._receiver = null;
	    this._sender = null;
	    this._socket = null;

	    if (address !== null) {
	      this._bufferedAmount = 0;
	      this._isServer = false;
	      this._redirects = 0;

	      if (protocols === undefined) {
	        protocols = [];
	      } else if (!Array.isArray(protocols)) {
	        if (typeof protocols === 'object' && protocols !== null) {
	          options = protocols;
	          protocols = [];
	        } else {
	          protocols = [protocols];
	        }
	      }

	      initAsClient(this, address, protocols, options);
	    } else {
	      this._autoPong = options.autoPong;
	      this._isServer = true;
	    }
	  }

	  /**
	   * For historical reasons, the custom "nodebuffer" type is used by the default
	   * instead of "blob".
	   *
	   * @type {String}
	   */
	  get binaryType() {
	    return this._binaryType;
	  }

	  set binaryType(type) {
	    if (!BINARY_TYPES.includes(type)) return;

	    this._binaryType = type;

	    //
	    // Allow to change `binaryType` on the fly.
	    //
	    if (this._receiver) this._receiver._binaryType = type;
	  }

	  /**
	   * @type {Number}
	   */
	  get bufferedAmount() {
	    if (!this._socket) return this._bufferedAmount;

	    return this._socket._writableState.length + this._sender._bufferedBytes;
	  }

	  /**
	   * @type {String}
	   */
	  get extensions() {
	    return Object.keys(this._extensions).join();
	  }

	  /**
	   * @type {Boolean}
	   */
	  get isPaused() {
	    return this._paused;
	  }

	  /**
	   * @type {Function}
	   */
	  /* istanbul ignore next */
	  get onclose() {
	    return null;
	  }

	  /**
	   * @type {Function}
	   */
	  /* istanbul ignore next */
	  get onerror() {
	    return null;
	  }

	  /**
	   * @type {Function}
	   */
	  /* istanbul ignore next */
	  get onopen() {
	    return null;
	  }

	  /**
	   * @type {Function}
	   */
	  /* istanbul ignore next */
	  get onmessage() {
	    return null;
	  }

	  /**
	   * @type {String}
	   */
	  get protocol() {
	    return this._protocol;
	  }

	  /**
	   * @type {Number}
	   */
	  get readyState() {
	    return this._readyState;
	  }

	  /**
	   * @type {String}
	   */
	  get url() {
	    return this._url;
	  }

	  /**
	   * Set up the socket and the internal resources.
	   *
	   * @param {Duplex} socket The network socket between the server and client
	   * @param {Buffer} head The first packet of the upgraded stream
	   * @param {Object} options Options object
	   * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
	   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
	   *     multiple times in the same tick
	   * @param {Function} [options.generateMask] The function used to generate the
	   *     masking key
	   * @param {Number} [options.maxPayload=0] The maximum allowed message size
	   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
	   *     not to skip UTF-8 validation for text and close messages
	   * @private
	   */
	  setSocket(socket, head, options) {
	    const receiver = new Receiver({
	      allowSynchronousEvents: options.allowSynchronousEvents,
	      binaryType: this.binaryType,
	      extensions: this._extensions,
	      isServer: this._isServer,
	      maxPayload: options.maxPayload,
	      skipUTF8Validation: options.skipUTF8Validation
	    });

	    const sender = new Sender(socket, this._extensions, options.generateMask);

	    this._receiver = receiver;
	    this._sender = sender;
	    this._socket = socket;

	    receiver[kWebSocket] = this;
	    sender[kWebSocket] = this;
	    socket[kWebSocket] = this;

	    receiver.on('conclude', receiverOnConclude);
	    receiver.on('drain', receiverOnDrain);
	    receiver.on('error', receiverOnError);
	    receiver.on('message', receiverOnMessage);
	    receiver.on('ping', receiverOnPing);
	    receiver.on('pong', receiverOnPong);

	    sender.onerror = senderOnError;

	    //
	    // These methods may not be available if `socket` is just a `Duplex`.
	    //
	    if (socket.setTimeout) socket.setTimeout(0);
	    if (socket.setNoDelay) socket.setNoDelay();

	    if (head.length > 0) socket.unshift(head);

	    socket.on('close', socketOnClose);
	    socket.on('data', socketOnData);
	    socket.on('end', socketOnEnd);
	    socket.on('error', socketOnError);

	    this._readyState = WebSocket.OPEN;
	    this.emit('open');
	  }

	  /**
	   * Emit the `'close'` event.
	   *
	   * @private
	   */
	  emitClose() {
	    if (!this._socket) {
	      this._readyState = WebSocket.CLOSED;
	      this.emit('close', this._closeCode, this._closeMessage);
	      return;
	    }

	    if (this._extensions[PerMessageDeflate.extensionName]) {
	      this._extensions[PerMessageDeflate.extensionName].cleanup();
	    }

	    this._receiver.removeAllListeners();
	    this._readyState = WebSocket.CLOSED;
	    this.emit('close', this._closeCode, this._closeMessage);
	  }

	  /**
	   * Start a closing handshake.
	   *
	   *          +----------+   +-----------+   +----------+
	   *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
	   *    |     +----------+   +-----------+   +----------+     |
	   *          +----------+   +-----------+         |
	   * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
	   *          +----------+   +-----------+   |
	   *    |           |                        |   +---+        |
	   *                +------------------------+-->|fin| - - - -
	   *    |         +---+                      |   +---+
	   *     - - - - -|fin|<---------------------+
	   *              +---+
	   *
	   * @param {Number} [code] Status code explaining why the connection is closing
	   * @param {(String|Buffer)} [data] The reason why the connection is
	   *     closing
	   * @public
	   */
	  close(code, data) {
	    if (this.readyState === WebSocket.CLOSED) return;
	    if (this.readyState === WebSocket.CONNECTING) {
	      const msg = 'WebSocket was closed before the connection was established';
	      abortHandshake(this, this._req, msg);
	      return;
	    }

	    if (this.readyState === WebSocket.CLOSING) {
	      if (
	        this._closeFrameSent &&
	        (this._closeFrameReceived || this._receiver._writableState.errorEmitted)
	      ) {
	        this._socket.end();
	      }

	      return;
	    }

	    this._readyState = WebSocket.CLOSING;
	    this._sender.close(code, data, !this._isServer, (err) => {
	      //
	      // This error is handled by the `'error'` listener on the socket. We only
	      // want to know if the close frame has been sent here.
	      //
	      if (err) return;

	      this._closeFrameSent = true;

	      if (
	        this._closeFrameReceived ||
	        this._receiver._writableState.errorEmitted
	      ) {
	        this._socket.end();
	      }
	    });

	    setCloseTimer(this);
	  }

	  /**
	   * Pause the socket.
	   *
	   * @public
	   */
	  pause() {
	    if (
	      this.readyState === WebSocket.CONNECTING ||
	      this.readyState === WebSocket.CLOSED
	    ) {
	      return;
	    }

	    this._paused = true;
	    this._socket.pause();
	  }

	  /**
	   * Send a ping.
	   *
	   * @param {*} [data] The data to send
	   * @param {Boolean} [mask] Indicates whether or not to mask `data`
	   * @param {Function} [cb] Callback which is executed when the ping is sent
	   * @public
	   */
	  ping(data, mask, cb) {
	    if (this.readyState === WebSocket.CONNECTING) {
	      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
	    }

	    if (typeof data === 'function') {
	      cb = data;
	      data = mask = undefined;
	    } else if (typeof mask === 'function') {
	      cb = mask;
	      mask = undefined;
	    }

	    if (typeof data === 'number') data = data.toString();

	    if (this.readyState !== WebSocket.OPEN) {
	      sendAfterClose(this, data, cb);
	      return;
	    }

	    if (mask === undefined) mask = !this._isServer;
	    this._sender.ping(data || EMPTY_BUFFER, mask, cb);
	  }

	  /**
	   * Send a pong.
	   *
	   * @param {*} [data] The data to send
	   * @param {Boolean} [mask] Indicates whether or not to mask `data`
	   * @param {Function} [cb] Callback which is executed when the pong is sent
	   * @public
	   */
	  pong(data, mask, cb) {
	    if (this.readyState === WebSocket.CONNECTING) {
	      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
	    }

	    if (typeof data === 'function') {
	      cb = data;
	      data = mask = undefined;
	    } else if (typeof mask === 'function') {
	      cb = mask;
	      mask = undefined;
	    }

	    if (typeof data === 'number') data = data.toString();

	    if (this.readyState !== WebSocket.OPEN) {
	      sendAfterClose(this, data, cb);
	      return;
	    }

	    if (mask === undefined) mask = !this._isServer;
	    this._sender.pong(data || EMPTY_BUFFER, mask, cb);
	  }

	  /**
	   * Resume the socket.
	   *
	   * @public
	   */
	  resume() {
	    if (
	      this.readyState === WebSocket.CONNECTING ||
	      this.readyState === WebSocket.CLOSED
	    ) {
	      return;
	    }

	    this._paused = false;
	    if (!this._receiver._writableState.needDrain) this._socket.resume();
	  }

	  /**
	   * Send a data message.
	   *
	   * @param {*} data The message to send
	   * @param {Object} [options] Options object
	   * @param {Boolean} [options.binary] Specifies whether `data` is binary or
	   *     text
	   * @param {Boolean} [options.compress] Specifies whether or not to compress
	   *     `data`
	   * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
	   *     last one
	   * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
	   * @param {Function} [cb] Callback which is executed when data is written out
	   * @public
	   */
	  send(data, options, cb) {
	    if (this.readyState === WebSocket.CONNECTING) {
	      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
	    }

	    if (typeof options === 'function') {
	      cb = options;
	      options = {};
	    }

	    if (typeof data === 'number') data = data.toString();

	    if (this.readyState !== WebSocket.OPEN) {
	      sendAfterClose(this, data, cb);
	      return;
	    }

	    const opts = {
	      binary: typeof data !== 'string',
	      mask: !this._isServer,
	      compress: true,
	      fin: true,
	      ...options
	    };

	    if (!this._extensions[PerMessageDeflate.extensionName]) {
	      opts.compress = false;
	    }

	    this._sender.send(data || EMPTY_BUFFER, opts, cb);
	  }

	  /**
	   * Forcibly close the connection.
	   *
	   * @public
	   */
	  terminate() {
	    if (this.readyState === WebSocket.CLOSED) return;
	    if (this.readyState === WebSocket.CONNECTING) {
	      const msg = 'WebSocket was closed before the connection was established';
	      abortHandshake(this, this._req, msg);
	      return;
	    }

	    if (this._socket) {
	      this._readyState = WebSocket.CLOSING;
	      this._socket.destroy();
	    }
	  }
	}

	/**
	 * @constant {Number} CONNECTING
	 * @memberof WebSocket
	 */
	Object.defineProperty(WebSocket, 'CONNECTING', {
	  enumerable: true,
	  value: readyStates.indexOf('CONNECTING')
	});

	/**
	 * @constant {Number} CONNECTING
	 * @memberof WebSocket.prototype
	 */
	Object.defineProperty(WebSocket.prototype, 'CONNECTING', {
	  enumerable: true,
	  value: readyStates.indexOf('CONNECTING')
	});

	/**
	 * @constant {Number} OPEN
	 * @memberof WebSocket
	 */
	Object.defineProperty(WebSocket, 'OPEN', {
	  enumerable: true,
	  value: readyStates.indexOf('OPEN')
	});

	/**
	 * @constant {Number} OPEN
	 * @memberof WebSocket.prototype
	 */
	Object.defineProperty(WebSocket.prototype, 'OPEN', {
	  enumerable: true,
	  value: readyStates.indexOf('OPEN')
	});

	/**
	 * @constant {Number} CLOSING
	 * @memberof WebSocket
	 */
	Object.defineProperty(WebSocket, 'CLOSING', {
	  enumerable: true,
	  value: readyStates.indexOf('CLOSING')
	});

	/**
	 * @constant {Number} CLOSING
	 * @memberof WebSocket.prototype
	 */
	Object.defineProperty(WebSocket.prototype, 'CLOSING', {
	  enumerable: true,
	  value: readyStates.indexOf('CLOSING')
	});

	/**
	 * @constant {Number} CLOSED
	 * @memberof WebSocket
	 */
	Object.defineProperty(WebSocket, 'CLOSED', {
	  enumerable: true,
	  value: readyStates.indexOf('CLOSED')
	});

	/**
	 * @constant {Number} CLOSED
	 * @memberof WebSocket.prototype
	 */
	Object.defineProperty(WebSocket.prototype, 'CLOSED', {
	  enumerable: true,
	  value: readyStates.indexOf('CLOSED')
	});

	[
	  'binaryType',
	  'bufferedAmount',
	  'extensions',
	  'isPaused',
	  'protocol',
	  'readyState',
	  'url'
	].forEach((property) => {
	  Object.defineProperty(WebSocket.prototype, property, { enumerable: true });
	});

	//
	// Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
	// See https://html.spec.whatwg.org/multipage/comms.html#the-websocket-interface
	//
	['open', 'error', 'close', 'message'].forEach((method) => {
	  Object.defineProperty(WebSocket.prototype, `on${method}`, {
	    enumerable: true,
	    get() {
	      for (const listener of this.listeners(method)) {
	        if (listener[kForOnEventAttribute]) return listener[kListener];
	      }

	      return null;
	    },
	    set(handler) {
	      for (const listener of this.listeners(method)) {
	        if (listener[kForOnEventAttribute]) {
	          this.removeListener(method, listener);
	          break;
	        }
	      }

	      if (typeof handler !== 'function') return;

	      this.addEventListener(method, handler, {
	        [kForOnEventAttribute]: true
	      });
	    }
	  });
	});

	WebSocket.prototype.addEventListener = addEventListener;
	WebSocket.prototype.removeEventListener = removeEventListener;

	websocket = WebSocket;

	/**
	 * Initialize a WebSocket client.
	 *
	 * @param {WebSocket} websocket The client to initialize
	 * @param {(String|URL)} address The URL to which to connect
	 * @param {Array} protocols The subprotocols
	 * @param {Object} [options] Connection options
	 * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether any
	 *     of the `'message'`, `'ping'`, and `'pong'` events can be emitted multiple
	 *     times in the same tick
	 * @param {Boolean} [options.autoPong=true] Specifies whether or not to
	 *     automatically send a pong in response to a ping
	 * @param {Function} [options.finishRequest] A function which can be used to
	 *     customize the headers of each http request before it is sent
	 * @param {Boolean} [options.followRedirects=false] Whether or not to follow
	 *     redirects
	 * @param {Function} [options.generateMask] The function used to generate the
	 *     masking key
	 * @param {Number} [options.handshakeTimeout] Timeout in milliseconds for the
	 *     handshake request
	 * @param {Number} [options.maxPayload=104857600] The maximum allowed message
	 *     size
	 * @param {Number} [options.maxRedirects=10] The maximum number of redirects
	 *     allowed
	 * @param {String} [options.origin] Value of the `Origin` or
	 *     `Sec-WebSocket-Origin` header
	 * @param {(Boolean|Object)} [options.perMessageDeflate=true] Enable/disable
	 *     permessage-deflate
	 * @param {Number} [options.protocolVersion=13] Value of the
	 *     `Sec-WebSocket-Version` header
	 * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
	 *     not to skip UTF-8 validation for text and close messages
	 * @private
	 */
	function initAsClient(websocket, address, protocols, options) {
	  const opts = {
	    allowSynchronousEvents: true,
	    autoPong: true,
	    protocolVersion: protocolVersions[1],
	    maxPayload: 100 * 1024 * 1024,
	    skipUTF8Validation: false,
	    perMessageDeflate: true,
	    followRedirects: false,
	    maxRedirects: 10,
	    ...options,
	    socketPath: undefined,
	    hostname: undefined,
	    protocol: undefined,
	    timeout: undefined,
	    method: 'GET',
	    host: undefined,
	    path: undefined,
	    port: undefined
	  };

	  websocket._autoPong = opts.autoPong;

	  if (!protocolVersions.includes(opts.protocolVersion)) {
	    throw new RangeError(
	      `Unsupported protocol version: ${opts.protocolVersion} ` +
	        `(supported versions: ${protocolVersions.join(', ')})`
	    );
	  }

	  let parsedUrl;

	  if (address instanceof URL) {
	    parsedUrl = address;
	  } else {
	    try {
	      parsedUrl = new URL(address);
	    } catch (e) {
	      throw new SyntaxError(`Invalid URL: ${address}`);
	    }
	  }

	  if (parsedUrl.protocol === 'http:') {
	    parsedUrl.protocol = 'ws:';
	  } else if (parsedUrl.protocol === 'https:') {
	    parsedUrl.protocol = 'wss:';
	  }

	  websocket._url = parsedUrl.href;

	  const isSecure = parsedUrl.protocol === 'wss:';
	  const isIpcUrl = parsedUrl.protocol === 'ws+unix:';
	  let invalidUrlMessage;

	  if (parsedUrl.protocol !== 'ws:' && !isSecure && !isIpcUrl) {
	    invalidUrlMessage =
	      'The URL\'s protocol must be one of "ws:", "wss:", ' +
	      '"http:", "https:", or "ws+unix:"';
	  } else if (isIpcUrl && !parsedUrl.pathname) {
	    invalidUrlMessage = "The URL's pathname is empty";
	  } else if (parsedUrl.hash) {
	    invalidUrlMessage = 'The URL contains a fragment identifier';
	  }

	  if (invalidUrlMessage) {
	    const err = new SyntaxError(invalidUrlMessage);

	    if (websocket._redirects === 0) {
	      throw err;
	    } else {
	      emitErrorAndClose(websocket, err);
	      return;
	    }
	  }

	  const defaultPort = isSecure ? 443 : 80;
	  const key = randomBytes(16).toString('base64');
	  const request = isSecure ? https.request : http.request;
	  const protocolSet = new Set();
	  let perMessageDeflate;

	  opts.createConnection =
	    opts.createConnection || (isSecure ? tlsConnect : netConnect);
	  opts.defaultPort = opts.defaultPort || defaultPort;
	  opts.port = parsedUrl.port || defaultPort;
	  opts.host = parsedUrl.hostname.startsWith('[')
	    ? parsedUrl.hostname.slice(1, -1)
	    : parsedUrl.hostname;
	  opts.headers = {
	    ...opts.headers,
	    'Sec-WebSocket-Version': opts.protocolVersion,
	    'Sec-WebSocket-Key': key,
	    Connection: 'Upgrade',
	    Upgrade: 'websocket'
	  };
	  opts.path = parsedUrl.pathname + parsedUrl.search;
	  opts.timeout = opts.handshakeTimeout;

	  if (opts.perMessageDeflate) {
	    perMessageDeflate = new PerMessageDeflate(
	      opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
	      false,
	      opts.maxPayload
	    );
	    opts.headers['Sec-WebSocket-Extensions'] = format({
	      [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
	    });
	  }
	  if (protocols.length) {
	    for (const protocol of protocols) {
	      if (
	        typeof protocol !== 'string' ||
	        !subprotocolRegex.test(protocol) ||
	        protocolSet.has(protocol)
	      ) {
	        throw new SyntaxError(
	          'An invalid or duplicated subprotocol was specified'
	        );
	      }

	      protocolSet.add(protocol);
	    }

	    opts.headers['Sec-WebSocket-Protocol'] = protocols.join(',');
	  }
	  if (opts.origin) {
	    if (opts.protocolVersion < 13) {
	      opts.headers['Sec-WebSocket-Origin'] = opts.origin;
	    } else {
	      opts.headers.Origin = opts.origin;
	    }
	  }
	  if (parsedUrl.username || parsedUrl.password) {
	    opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
	  }

	  if (isIpcUrl) {
	    const parts = opts.path.split(':');

	    opts.socketPath = parts[0];
	    opts.path = parts[1];
	  }

	  let req;

	  if (opts.followRedirects) {
	    if (websocket._redirects === 0) {
	      websocket._originalIpc = isIpcUrl;
	      websocket._originalSecure = isSecure;
	      websocket._originalHostOrSocketPath = isIpcUrl
	        ? opts.socketPath
	        : parsedUrl.host;

	      const headers = options && options.headers;

	      //
	      // Shallow copy the user provided options so that headers can be changed
	      // without mutating the original object.
	      //
	      options = { ...options, headers: {} };

	      if (headers) {
	        for (const [key, value] of Object.entries(headers)) {
	          options.headers[key.toLowerCase()] = value;
	        }
	      }
	    } else if (websocket.listenerCount('redirect') === 0) {
	      const isSameHost = isIpcUrl
	        ? websocket._originalIpc
	          ? opts.socketPath === websocket._originalHostOrSocketPath
	          : false
	        : websocket._originalIpc
	          ? false
	          : parsedUrl.host === websocket._originalHostOrSocketPath;

	      if (!isSameHost || (websocket._originalSecure && !isSecure)) {
	        //
	        // Match curl 7.77.0 behavior and drop the following headers. These
	        // headers are also dropped when following a redirect to a subdomain.
	        //
	        delete opts.headers.authorization;
	        delete opts.headers.cookie;

	        if (!isSameHost) delete opts.headers.host;

	        opts.auth = undefined;
	      }
	    }

	    //
	    // Match curl 7.77.0 behavior and make the first `Authorization` header win.
	    // If the `Authorization` header is set, then there is nothing to do as it
	    // will take precedence.
	    //
	    if (opts.auth && !options.headers.authorization) {
	      options.headers.authorization =
	        'Basic ' + Buffer.from(opts.auth).toString('base64');
	    }

	    req = websocket._req = request(opts);

	    if (websocket._redirects) {
	      //
	      // Unlike what is done for the `'upgrade'` event, no early exit is
	      // triggered here if the user calls `websocket.close()` or
	      // `websocket.terminate()` from a listener of the `'redirect'` event. This
	      // is because the user can also call `request.destroy()` with an error
	      // before calling `websocket.close()` or `websocket.terminate()` and this
	      // would result in an error being emitted on the `request` object with no
	      // `'error'` event listeners attached.
	      //
	      websocket.emit('redirect', websocket.url, req);
	    }
	  } else {
	    req = websocket._req = request(opts);
	  }

	  if (opts.timeout) {
	    req.on('timeout', () => {
	      abortHandshake(websocket, req, 'Opening handshake has timed out');
	    });
	  }

	  req.on('error', (err) => {
	    if (req === null || req[kAborted]) return;

	    req = websocket._req = null;
	    emitErrorAndClose(websocket, err);
	  });

	  req.on('response', (res) => {
	    const location = res.headers.location;
	    const statusCode = res.statusCode;

	    if (
	      location &&
	      opts.followRedirects &&
	      statusCode >= 300 &&
	      statusCode < 400
	    ) {
	      if (++websocket._redirects > opts.maxRedirects) {
	        abortHandshake(websocket, req, 'Maximum redirects exceeded');
	        return;
	      }

	      req.abort();

	      let addr;

	      try {
	        addr = new URL(location, address);
	      } catch (e) {
	        const err = new SyntaxError(`Invalid URL: ${location}`);
	        emitErrorAndClose(websocket, err);
	        return;
	      }

	      initAsClient(websocket, addr, protocols, options);
	    } else if (!websocket.emit('unexpected-response', req, res)) {
	      abortHandshake(
	        websocket,
	        req,
	        `Unexpected server response: ${res.statusCode}`
	      );
	    }
	  });

	  req.on('upgrade', (res, socket, head) => {
	    websocket.emit('upgrade', res);

	    //
	    // The user may have closed the connection from a listener of the
	    // `'upgrade'` event.
	    //
	    if (websocket.readyState !== WebSocket.CONNECTING) return;

	    req = websocket._req = null;

	    const upgrade = res.headers.upgrade;

	    if (upgrade === undefined || upgrade.toLowerCase() !== 'websocket') {
	      abortHandshake(websocket, socket, 'Invalid Upgrade header');
	      return;
	    }

	    const digest = createHash('sha1')
	      .update(key + GUID)
	      .digest('base64');

	    if (res.headers['sec-websocket-accept'] !== digest) {
	      abortHandshake(websocket, socket, 'Invalid Sec-WebSocket-Accept header');
	      return;
	    }

	    const serverProt = res.headers['sec-websocket-protocol'];
	    let protError;

	    if (serverProt !== undefined) {
	      if (!protocolSet.size) {
	        protError = 'Server sent a subprotocol but none was requested';
	      } else if (!protocolSet.has(serverProt)) {
	        protError = 'Server sent an invalid subprotocol';
	      }
	    } else if (protocolSet.size) {
	      protError = 'Server sent no subprotocol';
	    }

	    if (protError) {
	      abortHandshake(websocket, socket, protError);
	      return;
	    }

	    if (serverProt) websocket._protocol = serverProt;

	    const secWebSocketExtensions = res.headers['sec-websocket-extensions'];

	    if (secWebSocketExtensions !== undefined) {
	      if (!perMessageDeflate) {
	        const message =
	          'Server sent a Sec-WebSocket-Extensions header but no extension ' +
	          'was requested';
	        abortHandshake(websocket, socket, message);
	        return;
	      }

	      let extensions;

	      try {
	        extensions = parse(secWebSocketExtensions);
	      } catch (err) {
	        const message = 'Invalid Sec-WebSocket-Extensions header';
	        abortHandshake(websocket, socket, message);
	        return;
	      }

	      const extensionNames = Object.keys(extensions);

	      if (
	        extensionNames.length !== 1 ||
	        extensionNames[0] !== PerMessageDeflate.extensionName
	      ) {
	        const message = 'Server indicated an extension that was not requested';
	        abortHandshake(websocket, socket, message);
	        return;
	      }

	      try {
	        perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
	      } catch (err) {
	        const message = 'Invalid Sec-WebSocket-Extensions header';
	        abortHandshake(websocket, socket, message);
	        return;
	      }

	      websocket._extensions[PerMessageDeflate.extensionName] =
	        perMessageDeflate;
	    }

	    websocket.setSocket(socket, head, {
	      allowSynchronousEvents: opts.allowSynchronousEvents,
	      generateMask: opts.generateMask,
	      maxPayload: opts.maxPayload,
	      skipUTF8Validation: opts.skipUTF8Validation
	    });
	  });

	  if (opts.finishRequest) {
	    opts.finishRequest(req, websocket);
	  } else {
	    req.end();
	  }
	}

	/**
	 * Emit the `'error'` and `'close'` events.
	 *
	 * @param {WebSocket} websocket The WebSocket instance
	 * @param {Error} The error to emit
	 * @private
	 */
	function emitErrorAndClose(websocket, err) {
	  websocket._readyState = WebSocket.CLOSING;
	  //
	  // The following assignment is practically useless and is done only for
	  // consistency.
	  //
	  websocket._errorEmitted = true;
	  websocket.emit('error', err);
	  websocket.emitClose();
	}

	/**
	 * Create a `net.Socket` and initiate a connection.
	 *
	 * @param {Object} options Connection options
	 * @return {net.Socket} The newly created socket used to start the connection
	 * @private
	 */
	function netConnect(options) {
	  options.path = options.socketPath;
	  return net.connect(options);
	}

	/**
	 * Create a `tls.TLSSocket` and initiate a connection.
	 *
	 * @param {Object} options Connection options
	 * @return {tls.TLSSocket} The newly created socket used to start the connection
	 * @private
	 */
	function tlsConnect(options) {
	  options.path = undefined;

	  if (!options.servername && options.servername !== '') {
	    options.servername = net.isIP(options.host) ? '' : options.host;
	  }

	  return tls.connect(options);
	}

	/**
	 * Abort the handshake and emit an error.
	 *
	 * @param {WebSocket} websocket The WebSocket instance
	 * @param {(http.ClientRequest|net.Socket|tls.Socket)} stream The request to
	 *     abort or the socket to destroy
	 * @param {String} message The error message
	 * @private
	 */
	function abortHandshake(websocket, stream, message) {
	  websocket._readyState = WebSocket.CLOSING;

	  const err = new Error(message);
	  Error.captureStackTrace(err, abortHandshake);

	  if (stream.setHeader) {
	    stream[kAborted] = true;
	    stream.abort();

	    if (stream.socket && !stream.socket.destroyed) {
	      //
	      // On Node.js >= 14.3.0 `request.abort()` does not destroy the socket if
	      // called after the request completed. See
	      // https://github.com/websockets/ws/issues/1869.
	      //
	      stream.socket.destroy();
	    }

	    process.nextTick(emitErrorAndClose, websocket, err);
	  } else {
	    stream.destroy(err);
	    stream.once('error', websocket.emit.bind(websocket, 'error'));
	    stream.once('close', websocket.emitClose.bind(websocket));
	  }
	}

	/**
	 * Handle cases where the `ping()`, `pong()`, or `send()` methods are called
	 * when the `readyState` attribute is `CLOSING` or `CLOSED`.
	 *
	 * @param {WebSocket} websocket The WebSocket instance
	 * @param {*} [data] The data to send
	 * @param {Function} [cb] Callback
	 * @private
	 */
	function sendAfterClose(websocket, data, cb) {
	  if (data) {
	    const length = isBlob(data) ? data.size : toBuffer(data).length;

	    //
	    // The `_bufferedAmount` property is used only when the peer is a client and
	    // the opening handshake fails. Under these circumstances, in fact, the
	    // `setSocket()` method is not called, so the `_socket` and `_sender`
	    // properties are set to `null`.
	    //
	    if (websocket._socket) websocket._sender._bufferedBytes += length;
	    else websocket._bufferedAmount += length;
	  }

	  if (cb) {
	    const err = new Error(
	      `WebSocket is not open: readyState ${websocket.readyState} ` +
	        `(${readyStates[websocket.readyState]})`
	    );
	    process.nextTick(cb, err);
	  }
	}

	/**
	 * The listener of the `Receiver` `'conclude'` event.
	 *
	 * @param {Number} code The status code
	 * @param {Buffer} reason The reason for closing
	 * @private
	 */
	function receiverOnConclude(code, reason) {
	  const websocket = this[kWebSocket];

	  websocket._closeFrameReceived = true;
	  websocket._closeMessage = reason;
	  websocket._closeCode = code;

	  if (websocket._socket[kWebSocket] === undefined) return;

	  websocket._socket.removeListener('data', socketOnData);
	  process.nextTick(resume, websocket._socket);

	  if (code === 1005) websocket.close();
	  else websocket.close(code, reason);
	}

	/**
	 * The listener of the `Receiver` `'drain'` event.
	 *
	 * @private
	 */
	function receiverOnDrain() {
	  const websocket = this[kWebSocket];

	  if (!websocket.isPaused) websocket._socket.resume();
	}

	/**
	 * The listener of the `Receiver` `'error'` event.
	 *
	 * @param {(RangeError|Error)} err The emitted error
	 * @private
	 */
	function receiverOnError(err) {
	  const websocket = this[kWebSocket];

	  if (websocket._socket[kWebSocket] !== undefined) {
	    websocket._socket.removeListener('data', socketOnData);

	    //
	    // On Node.js < 14.0.0 the `'error'` event is emitted synchronously. See
	    // https://github.com/websockets/ws/issues/1940.
	    //
	    process.nextTick(resume, websocket._socket);

	    websocket.close(err[kStatusCode]);
	  }

	  if (!websocket._errorEmitted) {
	    websocket._errorEmitted = true;
	    websocket.emit('error', err);
	  }
	}

	/**
	 * The listener of the `Receiver` `'finish'` event.
	 *
	 * @private
	 */
	function receiverOnFinish() {
	  this[kWebSocket].emitClose();
	}

	/**
	 * The listener of the `Receiver` `'message'` event.
	 *
	 * @param {Buffer|ArrayBuffer|Buffer[])} data The message
	 * @param {Boolean} isBinary Specifies whether the message is binary or not
	 * @private
	 */
	function receiverOnMessage(data, isBinary) {
	  this[kWebSocket].emit('message', data, isBinary);
	}

	/**
	 * The listener of the `Receiver` `'ping'` event.
	 *
	 * @param {Buffer} data The data included in the ping frame
	 * @private
	 */
	function receiverOnPing(data) {
	  const websocket = this[kWebSocket];

	  if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
	  websocket.emit('ping', data);
	}

	/**
	 * The listener of the `Receiver` `'pong'` event.
	 *
	 * @param {Buffer} data The data included in the pong frame
	 * @private
	 */
	function receiverOnPong(data) {
	  this[kWebSocket].emit('pong', data);
	}

	/**
	 * Resume a readable stream
	 *
	 * @param {Readable} stream The readable stream
	 * @private
	 */
	function resume(stream) {
	  stream.resume();
	}

	/**
	 * The `Sender` error event handler.
	 *
	 * @param {Error} The error
	 * @private
	 */
	function senderOnError(err) {
	  const websocket = this[kWebSocket];

	  if (websocket.readyState === WebSocket.CLOSED) return;
	  if (websocket.readyState === WebSocket.OPEN) {
	    websocket._readyState = WebSocket.CLOSING;
	    setCloseTimer(websocket);
	  }

	  //
	  // `socket.end()` is used instead of `socket.destroy()` to allow the other
	  // peer to finish sending queued data. There is no need to set a timer here
	  // because `CLOSING` means that it is already set or not needed.
	  //
	  this._socket.end();

	  if (!websocket._errorEmitted) {
	    websocket._errorEmitted = true;
	    websocket.emit('error', err);
	  }
	}

	/**
	 * Set a timer to destroy the underlying raw socket of a WebSocket.
	 *
	 * @param {WebSocket} websocket The WebSocket instance
	 * @private
	 */
	function setCloseTimer(websocket) {
	  websocket._closeTimer = setTimeout(
	    websocket._socket.destroy.bind(websocket._socket),
	    closeTimeout
	  );
	}

	/**
	 * The listener of the socket `'close'` event.
	 *
	 * @private
	 */
	function socketOnClose() {
	  const websocket = this[kWebSocket];

	  this.removeListener('close', socketOnClose);
	  this.removeListener('data', socketOnData);
	  this.removeListener('end', socketOnEnd);

	  websocket._readyState = WebSocket.CLOSING;

	  let chunk;

	  //
	  // The close frame might not have been received or the `'end'` event emitted,
	  // for example, if the socket was destroyed due to an error. Ensure that the
	  // `receiver` stream is closed after writing any remaining buffered data to
	  // it. If the readable side of the socket is in flowing mode then there is no
	  // buffered data as everything has been already written and `readable.read()`
	  // will return `null`. If instead, the socket is paused, any possible buffered
	  // data will be read as a single chunk.
	  //
	  if (
	    !this._readableState.endEmitted &&
	    !websocket._closeFrameReceived &&
	    !websocket._receiver._writableState.errorEmitted &&
	    (chunk = websocket._socket.read()) !== null
	  ) {
	    websocket._receiver.write(chunk);
	  }

	  websocket._receiver.end();

	  this[kWebSocket] = undefined;

	  clearTimeout(websocket._closeTimer);

	  if (
	    websocket._receiver._writableState.finished ||
	    websocket._receiver._writableState.errorEmitted
	  ) {
	    websocket.emitClose();
	  } else {
	    websocket._receiver.on('error', receiverOnFinish);
	    websocket._receiver.on('finish', receiverOnFinish);
	  }
	}

	/**
	 * The listener of the socket `'data'` event.
	 *
	 * @param {Buffer} chunk A chunk of data
	 * @private
	 */
	function socketOnData(chunk) {
	  if (!this[kWebSocket]._receiver.write(chunk)) {
	    this.pause();
	  }
	}

	/**
	 * The listener of the socket `'end'` event.
	 *
	 * @private
	 */
	function socketOnEnd() {
	  const websocket = this[kWebSocket];

	  websocket._readyState = WebSocket.CLOSING;
	  websocket._receiver.end();
	  this.end();
	}

	/**
	 * The listener of the socket `'error'` event.
	 *
	 * @private
	 */
	function socketOnError() {
	  const websocket = this[kWebSocket];

	  this.removeListener('error', socketOnError);
	  this.on('error', NOOP);

	  if (websocket) {
	    websocket._readyState = WebSocket.CLOSING;
	    this.destroy();
	  }
	}
	return websocket;
}

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^WebSocket$" }] */

var stream;
var hasRequiredStream;

function requireStream () {
	if (hasRequiredStream) return stream;
	hasRequiredStream = 1;

	requireWebsocket();
	const { Duplex } = require$$1;

	/**
	 * Emits the `'close'` event on a stream.
	 *
	 * @param {Duplex} stream The stream.
	 * @private
	 */
	function emitClose(stream) {
	  stream.emit('close');
	}

	/**
	 * The listener of the `'end'` event.
	 *
	 * @private
	 */
	function duplexOnEnd() {
	  if (!this.destroyed && this._writableState.finished) {
	    this.destroy();
	  }
	}

	/**
	 * The listener of the `'error'` event.
	 *
	 * @param {Error} err The error
	 * @private
	 */
	function duplexOnError(err) {
	  this.removeListener('error', duplexOnError);
	  this.destroy();
	  if (this.listenerCount('error') === 0) {
	    // Do not suppress the throwing behavior.
	    this.emit('error', err);
	  }
	}

	/**
	 * Wraps a `WebSocket` in a duplex stream.
	 *
	 * @param {WebSocket} ws The `WebSocket` to wrap
	 * @param {Object} [options] The options for the `Duplex` constructor
	 * @return {Duplex} The duplex stream
	 * @public
	 */
	function createWebSocketStream(ws, options) {
	  let terminateOnDestroy = true;

	  const duplex = new Duplex({
	    ...options,
	    autoDestroy: false,
	    emitClose: false,
	    objectMode: false,
	    writableObjectMode: false
	  });

	  ws.on('message', function message(msg, isBinary) {
	    const data =
	      !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;

	    if (!duplex.push(data)) ws.pause();
	  });

	  ws.once('error', function error(err) {
	    if (duplex.destroyed) return;

	    // Prevent `ws.terminate()` from being called by `duplex._destroy()`.
	    //
	    // - If the `'error'` event is emitted before the `'open'` event, then
	    //   `ws.terminate()` is a noop as no socket is assigned.
	    // - Otherwise, the error is re-emitted by the listener of the `'error'`
	    //   event of the `Receiver` object. The listener already closes the
	    //   connection by calling `ws.close()`. This allows a close frame to be
	    //   sent to the other peer. If `ws.terminate()` is called right after this,
	    //   then the close frame might not be sent.
	    terminateOnDestroy = false;
	    duplex.destroy(err);
	  });

	  ws.once('close', function close() {
	    if (duplex.destroyed) return;

	    duplex.push(null);
	  });

	  duplex._destroy = function (err, callback) {
	    if (ws.readyState === ws.CLOSED) {
	      callback(err);
	      process.nextTick(emitClose, duplex);
	      return;
	    }

	    let called = false;

	    ws.once('error', function error(err) {
	      called = true;
	      callback(err);
	    });

	    ws.once('close', function close() {
	      if (!called) callback(err);
	      process.nextTick(emitClose, duplex);
	    });

	    if (terminateOnDestroy) ws.terminate();
	  };

	  duplex._final = function (callback) {
	    if (ws.readyState === ws.CONNECTING) {
	      ws.once('open', function open() {
	        duplex._final(callback);
	      });
	      return;
	    }

	    // If the value of the `_socket` property is `null` it means that `ws` is a
	    // client websocket and the handshake failed. In fact, when this happens, a
	    // socket is never assigned to the websocket. Wait for the `'error'` event
	    // that will be emitted by the websocket.
	    if (ws._socket === null) return;

	    if (ws._socket._writableState.finished) {
	      callback();
	      if (duplex._readableState.endEmitted) duplex.destroy();
	    } else {
	      ws._socket.once('finish', function finish() {
	        // `duplex` is not destroyed here because the `'end'` event will be
	        // emitted on `duplex` after this `'finish'` event. The EOF signaling
	        // `null` chunk is, in fact, pushed when the websocket emits `'close'`.
	        callback();
	      });
	      ws.close();
	    }
	  };

	  duplex._read = function () {
	    if (ws.isPaused) ws.resume();
	  };

	  duplex._write = function (chunk, encoding, callback) {
	    if (ws.readyState === ws.CONNECTING) {
	      ws.once('open', function open() {
	        duplex._write(chunk, encoding, callback);
	      });
	      return;
	    }

	    ws.send(chunk, callback);
	  };

	  duplex.on('end', duplexOnEnd);
	  duplex.on('error', duplexOnError);
	  return duplex;
	}

	stream = createWebSocketStream;
	return stream;
}

requireStream();

requireReceiver();

requireSender();

var websocketExports = requireWebsocket();
var WebSocket = /*@__PURE__*/getDefaultExportFromCjs(websocketExports);

var subprotocol;
var hasRequiredSubprotocol;

function requireSubprotocol () {
	if (hasRequiredSubprotocol) return subprotocol;
	hasRequiredSubprotocol = 1;

	const { tokenChars } = requireValidation();

	/**
	 * Parses the `Sec-WebSocket-Protocol` header into a set of subprotocol names.
	 *
	 * @param {String} header The field value of the header
	 * @return {Set} The subprotocol names
	 * @public
	 */
	function parse(header) {
	  const protocols = new Set();
	  let start = -1;
	  let end = -1;
	  let i = 0;

	  for (i; i < header.length; i++) {
	    const code = header.charCodeAt(i);

	    if (end === -1 && tokenChars[code] === 1) {
	      if (start === -1) start = i;
	    } else if (
	      i !== 0 &&
	      (code === 0x20 /* ' ' */ || code === 0x09) /* '\t' */
	    ) {
	      if (end === -1 && start !== -1) end = i;
	    } else if (code === 0x2c /* ',' */) {
	      if (start === -1) {
	        throw new SyntaxError(`Unexpected character at index ${i}`);
	      }

	      if (end === -1) end = i;

	      const protocol = header.slice(start, end);

	      if (protocols.has(protocol)) {
	        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
	      }

	      protocols.add(protocol);
	      start = end = -1;
	    } else {
	      throw new SyntaxError(`Unexpected character at index ${i}`);
	    }
	  }

	  if (start === -1 || end !== -1) {
	    throw new SyntaxError('Unexpected end of input');
	  }

	  const protocol = header.slice(start, i);

	  if (protocols.has(protocol)) {
	    throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
	  }

	  protocols.add(protocol);
	  return protocols;
	}

	subprotocol = { parse };
	return subprotocol;
}

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Duplex$", "caughtErrors": "none" }] */

var websocketServer;
var hasRequiredWebsocketServer;

function requireWebsocketServer () {
	if (hasRequiredWebsocketServer) return websocketServer;
	hasRequiredWebsocketServer = 1;

	const EventEmitter = require$$0$2;
	const http = require$$2;
	const { Duplex } = require$$1;
	const { createHash } = require$$1$1;

	const extension = requireExtension();
	const PerMessageDeflate = requirePermessageDeflate();
	const subprotocol = requireSubprotocol();
	const WebSocket = requireWebsocket();
	const { GUID, kWebSocket } = requireConstants$1();

	const keyRegex = /^[+/0-9A-Za-z]{22}==$/;

	const RUNNING = 0;
	const CLOSING = 1;
	const CLOSED = 2;

	/**
	 * Class representing a WebSocket server.
	 *
	 * @extends EventEmitter
	 */
	class WebSocketServer extends EventEmitter {
	  /**
	   * Create a `WebSocketServer` instance.
	   *
	   * @param {Object} options Configuration options
	   * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
	   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
	   *     multiple times in the same tick
	   * @param {Boolean} [options.autoPong=true] Specifies whether or not to
	   *     automatically send a pong in response to a ping
	   * @param {Number} [options.backlog=511] The maximum length of the queue of
	   *     pending connections
	   * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
	   *     track clients
	   * @param {Function} [options.handleProtocols] A hook to handle protocols
	   * @param {String} [options.host] The hostname where to bind the server
	   * @param {Number} [options.maxPayload=104857600] The maximum allowed message
	   *     size
	   * @param {Boolean} [options.noServer=false] Enable no server mode
	   * @param {String} [options.path] Accept only connections matching this path
	   * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
	   *     permessage-deflate
	   * @param {Number} [options.port] The port where to bind the server
	   * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
	   *     server to use
	   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
	   *     not to skip UTF-8 validation for text and close messages
	   * @param {Function} [options.verifyClient] A hook to reject connections
	   * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
	   *     class to use. It must be the `WebSocket` class or class that extends it
	   * @param {Function} [callback] A listener for the `listening` event
	   */
	  constructor(options, callback) {
	    super();

	    options = {
	      allowSynchronousEvents: true,
	      autoPong: true,
	      maxPayload: 100 * 1024 * 1024,
	      skipUTF8Validation: false,
	      perMessageDeflate: false,
	      handleProtocols: null,
	      clientTracking: true,
	      verifyClient: null,
	      noServer: false,
	      backlog: null, // use default (511 as implemented in net.js)
	      server: null,
	      host: null,
	      path: null,
	      port: null,
	      WebSocket,
	      ...options
	    };

	    if (
	      (options.port == null && !options.server && !options.noServer) ||
	      (options.port != null && (options.server || options.noServer)) ||
	      (options.server && options.noServer)
	    ) {
	      throw new TypeError(
	        'One and only one of the "port", "server", or "noServer" options ' +
	          'must be specified'
	      );
	    }

	    if (options.port != null) {
	      this._server = http.createServer((req, res) => {
	        const body = http.STATUS_CODES[426];

	        res.writeHead(426, {
	          'Content-Length': body.length,
	          'Content-Type': 'text/plain'
	        });
	        res.end(body);
	      });
	      this._server.listen(
	        options.port,
	        options.host,
	        options.backlog,
	        callback
	      );
	    } else if (options.server) {
	      this._server = options.server;
	    }

	    if (this._server) {
	      const emitConnection = this.emit.bind(this, 'connection');

	      this._removeListeners = addListeners(this._server, {
	        listening: this.emit.bind(this, 'listening'),
	        error: this.emit.bind(this, 'error'),
	        upgrade: (req, socket, head) => {
	          this.handleUpgrade(req, socket, head, emitConnection);
	        }
	      });
	    }

	    if (options.perMessageDeflate === true) options.perMessageDeflate = {};
	    if (options.clientTracking) {
	      this.clients = new Set();
	      this._shouldEmitClose = false;
	    }

	    this.options = options;
	    this._state = RUNNING;
	  }

	  /**
	   * Returns the bound address, the address family name, and port of the server
	   * as reported by the operating system if listening on an IP socket.
	   * If the server is listening on a pipe or UNIX domain socket, the name is
	   * returned as a string.
	   *
	   * @return {(Object|String|null)} The address of the server
	   * @public
	   */
	  address() {
	    if (this.options.noServer) {
	      throw new Error('The server is operating in "noServer" mode');
	    }

	    if (!this._server) return null;
	    return this._server.address();
	  }

	  /**
	   * Stop the server from accepting new connections and emit the `'close'` event
	   * when all existing connections are closed.
	   *
	   * @param {Function} [cb] A one-time listener for the `'close'` event
	   * @public
	   */
	  close(cb) {
	    if (this._state === CLOSED) {
	      if (cb) {
	        this.once('close', () => {
	          cb(new Error('The server is not running'));
	        });
	      }

	      process.nextTick(emitClose, this);
	      return;
	    }

	    if (cb) this.once('close', cb);

	    if (this._state === CLOSING) return;
	    this._state = CLOSING;

	    if (this.options.noServer || this.options.server) {
	      if (this._server) {
	        this._removeListeners();
	        this._removeListeners = this._server = null;
	      }

	      if (this.clients) {
	        if (!this.clients.size) {
	          process.nextTick(emitClose, this);
	        } else {
	          this._shouldEmitClose = true;
	        }
	      } else {
	        process.nextTick(emitClose, this);
	      }
	    } else {
	      const server = this._server;

	      this._removeListeners();
	      this._removeListeners = this._server = null;

	      //
	      // The HTTP/S server was created internally. Close it, and rely on its
	      // `'close'` event.
	      //
	      server.close(() => {
	        emitClose(this);
	      });
	    }
	  }

	  /**
	   * See if a given request should be handled by this server instance.
	   *
	   * @param {http.IncomingMessage} req Request object to inspect
	   * @return {Boolean} `true` if the request is valid, else `false`
	   * @public
	   */
	  shouldHandle(req) {
	    if (this.options.path) {
	      const index = req.url.indexOf('?');
	      const pathname = index !== -1 ? req.url.slice(0, index) : req.url;

	      if (pathname !== this.options.path) return false;
	    }

	    return true;
	  }

	  /**
	   * Handle a HTTP Upgrade request.
	   *
	   * @param {http.IncomingMessage} req The request object
	   * @param {Duplex} socket The network socket between the server and client
	   * @param {Buffer} head The first packet of the upgraded stream
	   * @param {Function} cb Callback
	   * @public
	   */
	  handleUpgrade(req, socket, head, cb) {
	    socket.on('error', socketOnError);

	    const key = req.headers['sec-websocket-key'];
	    const upgrade = req.headers.upgrade;
	    const version = +req.headers['sec-websocket-version'];

	    if (req.method !== 'GET') {
	      const message = 'Invalid HTTP method';
	      abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
	      return;
	    }

	    if (upgrade === undefined || upgrade.toLowerCase() !== 'websocket') {
	      const message = 'Invalid Upgrade header';
	      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
	      return;
	    }

	    if (key === undefined || !keyRegex.test(key)) {
	      const message = 'Missing or invalid Sec-WebSocket-Key header';
	      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
	      return;
	    }

	    if (version !== 13 && version !== 8) {
	      const message = 'Missing or invalid Sec-WebSocket-Version header';
	      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
	        'Sec-WebSocket-Version': '13, 8'
	      });
	      return;
	    }

	    if (!this.shouldHandle(req)) {
	      abortHandshake(socket, 400);
	      return;
	    }

	    const secWebSocketProtocol = req.headers['sec-websocket-protocol'];
	    let protocols = new Set();

	    if (secWebSocketProtocol !== undefined) {
	      try {
	        protocols = subprotocol.parse(secWebSocketProtocol);
	      } catch (err) {
	        const message = 'Invalid Sec-WebSocket-Protocol header';
	        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
	        return;
	      }
	    }

	    const secWebSocketExtensions = req.headers['sec-websocket-extensions'];
	    const extensions = {};

	    if (
	      this.options.perMessageDeflate &&
	      secWebSocketExtensions !== undefined
	    ) {
	      const perMessageDeflate = new PerMessageDeflate(
	        this.options.perMessageDeflate,
	        true,
	        this.options.maxPayload
	      );

	      try {
	        const offers = extension.parse(secWebSocketExtensions);

	        if (offers[PerMessageDeflate.extensionName]) {
	          perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
	          extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
	        }
	      } catch (err) {
	        const message =
	          'Invalid or unacceptable Sec-WebSocket-Extensions header';
	        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
	        return;
	      }
	    }

	    //
	    // Optionally call external client verification handler.
	    //
	    if (this.options.verifyClient) {
	      const info = {
	        origin:
	          req.headers[`${version === 8 ? 'sec-websocket-origin' : 'origin'}`],
	        secure: !!(req.socket.authorized || req.socket.encrypted),
	        req
	      };

	      if (this.options.verifyClient.length === 2) {
	        this.options.verifyClient(info, (verified, code, message, headers) => {
	          if (!verified) {
	            return abortHandshake(socket, code || 401, message, headers);
	          }

	          this.completeUpgrade(
	            extensions,
	            key,
	            protocols,
	            req,
	            socket,
	            head,
	            cb
	          );
	        });
	        return;
	      }

	      if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
	    }

	    this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
	  }

	  /**
	   * Upgrade the connection to WebSocket.
	   *
	   * @param {Object} extensions The accepted extensions
	   * @param {String} key The value of the `Sec-WebSocket-Key` header
	   * @param {Set} protocols The subprotocols
	   * @param {http.IncomingMessage} req The request object
	   * @param {Duplex} socket The network socket between the server and client
	   * @param {Buffer} head The first packet of the upgraded stream
	   * @param {Function} cb Callback
	   * @throws {Error} If called more than once with the same socket
	   * @private
	   */
	  completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
	    //
	    // Destroy the socket if the client has already sent a FIN packet.
	    //
	    if (!socket.readable || !socket.writable) return socket.destroy();

	    if (socket[kWebSocket]) {
	      throw new Error(
	        'server.handleUpgrade() was called more than once with the same ' +
	          'socket, possibly due to a misconfiguration'
	      );
	    }

	    if (this._state > RUNNING) return abortHandshake(socket, 503);

	    const digest = createHash('sha1')
	      .update(key + GUID)
	      .digest('base64');

	    const headers = [
	      'HTTP/1.1 101 Switching Protocols',
	      'Upgrade: websocket',
	      'Connection: Upgrade',
	      `Sec-WebSocket-Accept: ${digest}`
	    ];

	    const ws = new this.options.WebSocket(null, undefined, this.options);

	    if (protocols.size) {
	      //
	      // Optionally call external protocol selection handler.
	      //
	      const protocol = this.options.handleProtocols
	        ? this.options.handleProtocols(protocols, req)
	        : protocols.values().next().value;

	      if (protocol) {
	        headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
	        ws._protocol = protocol;
	      }
	    }

	    if (extensions[PerMessageDeflate.extensionName]) {
	      const params = extensions[PerMessageDeflate.extensionName].params;
	      const value = extension.format({
	        [PerMessageDeflate.extensionName]: [params]
	      });
	      headers.push(`Sec-WebSocket-Extensions: ${value}`);
	      ws._extensions = extensions;
	    }

	    //
	    // Allow external modification/inspection of handshake headers.
	    //
	    this.emit('headers', headers, req);

	    socket.write(headers.concat('\r\n').join('\r\n'));
	    socket.removeListener('error', socketOnError);

	    ws.setSocket(socket, head, {
	      allowSynchronousEvents: this.options.allowSynchronousEvents,
	      maxPayload: this.options.maxPayload,
	      skipUTF8Validation: this.options.skipUTF8Validation
	    });

	    if (this.clients) {
	      this.clients.add(ws);
	      ws.on('close', () => {
	        this.clients.delete(ws);

	        if (this._shouldEmitClose && !this.clients.size) {
	          process.nextTick(emitClose, this);
	        }
	      });
	    }

	    cb(ws, req);
	  }
	}

	websocketServer = WebSocketServer;

	/**
	 * Add event listeners on an `EventEmitter` using a map of <event, listener>
	 * pairs.
	 *
	 * @param {EventEmitter} server The event emitter
	 * @param {Object.<String, Function>} map The listeners to add
	 * @return {Function} A function that will remove the added listeners when
	 *     called
	 * @private
	 */
	function addListeners(server, map) {
	  for (const event of Object.keys(map)) server.on(event, map[event]);

	  return function removeListeners() {
	    for (const event of Object.keys(map)) {
	      server.removeListener(event, map[event]);
	    }
	  };
	}

	/**
	 * Emit a `'close'` event on an `EventEmitter`.
	 *
	 * @param {EventEmitter} server The event emitter
	 * @private
	 */
	function emitClose(server) {
	  server._state = CLOSED;
	  server.emit('close');
	}

	/**
	 * Handle socket errors.
	 *
	 * @private
	 */
	function socketOnError() {
	  this.destroy();
	}

	/**
	 * Close the connection when preconditions are not fulfilled.
	 *
	 * @param {Duplex} socket The socket of the upgrade request
	 * @param {Number} code The HTTP response status code
	 * @param {String} [message] The HTTP response body
	 * @param {Object} [headers] Additional HTTP response headers
	 * @private
	 */
	function abortHandshake(socket, code, message, headers) {
	  //
	  // The socket is writable unless the user destroyed or ended it before calling
	  // `server.handleUpgrade()` or in the `verifyClient` function, which is a user
	  // error. Handling this does not make much sense as the worst that can happen
	  // is that some of the data written by the user might be discarded due to the
	  // call to `socket.end()` below, which triggers an `'error'` event that in
	  // turn causes the socket to be destroyed.
	  //
	  message = message || http.STATUS_CODES[code];
	  headers = {
	    Connection: 'close',
	    'Content-Type': 'text/html',
	    'Content-Length': Buffer.byteLength(message),
	    ...headers
	  };

	  socket.once('finish', socket.destroy);

	  socket.end(
	    `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` +
	      Object.keys(headers)
	        .map((h) => `${h}: ${headers[h]}`)
	        .join('\r\n') +
	      '\r\n\r\n' +
	      message
	  );
	}

	/**
	 * Emit a `'wsClientError'` event on a `WebSocketServer` if there is at least
	 * one listener for it, otherwise call `abortHandshake()`.
	 *
	 * @param {WebSocketServer} server The WebSocket server
	 * @param {http.IncomingMessage} req The request object
	 * @param {Duplex} socket The socket of the upgrade request
	 * @param {Number} code The HTTP response status code
	 * @param {String} message The HTTP response body
	 * @param {Object} [headers] The HTTP response headers
	 * @private
	 */
	function abortHandshakeOrEmitwsClientError(
	  server,
	  req,
	  socket,
	  code,
	  message,
	  headers
	) {
	  if (server.listenerCount('wsClientError')) {
	    const err = new Error(message);
	    Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);

	    server.emit('wsClientError', err, socket, req);
	  } else {
	    abortHandshake(socket, code, message, headers);
	  }
	}
	return websocketServer;
}

requireWebsocketServer();

/**!
 * @author Elgato
 * @module elgato/streamdeck
 * @license MIT
 * @copyright Copyright (c) Corsair Memory Inc.
 */
/**
 * Stream Deck device types.
 */
var DeviceType;
(function (DeviceType) {
    /**
     * Stream Deck, comprised of 15 customizable LCD keys in a 5 x 3 layout.
     */
    DeviceType[DeviceType["StreamDeck"] = 0] = "StreamDeck";
    /**
     * Stream Deck Mini, comprised of 6 customizable LCD keys in a 3 x 2 layout.
     */
    DeviceType[DeviceType["StreamDeckMini"] = 1] = "StreamDeckMini";
    /**
     * Stream Deck XL, comprised of 32 customizable LCD keys in an 8 x 4 layout.
     */
    DeviceType[DeviceType["StreamDeckXL"] = 2] = "StreamDeckXL";
    /**
     * Stream Deck Mobile, for iOS and Android.
     */
    DeviceType[DeviceType["StreamDeckMobile"] = 3] = "StreamDeckMobile";
    /**
     * Corsair G Keys, available on select Corsair keyboards.
     */
    DeviceType[DeviceType["CorsairGKeys"] = 4] = "CorsairGKeys";
    /**
     * Stream Deck Pedal, comprised of 3 customizable pedals.
     */
    DeviceType[DeviceType["StreamDeckPedal"] = 5] = "StreamDeckPedal";
    /**
     * Corsair Voyager laptop, comprising 10 buttons in a horizontal line above the keyboard.
     */
    DeviceType[DeviceType["CorsairVoyager"] = 6] = "CorsairVoyager";
    /**
     * Stream Deck +, comprised of 8 customizable LCD keys in a 4 x 2 layout, a touch strip, and 4 dials.
     */
    DeviceType[DeviceType["StreamDeckPlus"] = 7] = "StreamDeckPlus";
    /**
     * SCUF controller G keys, available on select SCUF controllers, for example SCUF Envision.
     */
    DeviceType[DeviceType["SCUFController"] = 8] = "SCUFController";
    /**
     * Stream Deck Neo, comprised of 8 customizable LCD keys in a 4 x 2 layout, an info bar, and 2 touch points for page navigation.
     */
    DeviceType[DeviceType["StreamDeckNeo"] = 9] = "StreamDeckNeo";
    /**
     * Stream Deck Studio, comprised of 32 customizable LCD keys in a 16 x 2 layout, and 2 dials (1 on either side).
     */
    DeviceType[DeviceType["StreamDeckStudio"] = 10] = "StreamDeckStudio";
    /**
     * Virtual Stream Deck, comprised of 1 to 64 action (on-screen) on a scalable canvas, with a maximum layout of 8 x 8.
     */
    DeviceType[DeviceType["VirtualStreamDeck"] = 11] = "VirtualStreamDeck";
})(DeviceType || (DeviceType = {}));

/**
 * List of available types that can be applied to {@link Bar} and {@link GBar} to determine their style.
 */
var BarSubType;
(function (BarSubType) {
    /**
     * Rectangle bar; the bar fills from left to right, determined by the {@link Bar.value}, similar to a standard progress bar.
     */
    BarSubType[BarSubType["Rectangle"] = 0] = "Rectangle";
    /**
     * Rectangle bar; the bar fills outwards from the centre of the bar, determined by the {@link Bar.value}.
     * @example
     * // Value is 2, range is 1-10.
     * // [  ███     ]
     * @example
     * // Value is 10, range is 1-10.
     * // [     █████]
     */
    BarSubType[BarSubType["DoubleRectangle"] = 1] = "DoubleRectangle";
    /**
     * Trapezoid bar, represented as a right-angle triangle; the bar fills from left to right, determined by the {@link Bar.value}, similar to a volume meter.
     */
    BarSubType[BarSubType["Trapezoid"] = 2] = "Trapezoid";
    /**
     * Trapezoid bar, represented by two right-angle triangles; the bar fills outwards from the centre of the bar, determined by the {@link Bar.value}. See {@link BarSubType.DoubleRectangle}.
     */
    BarSubType[BarSubType["DoubleTrapezoid"] = 3] = "DoubleTrapezoid";
    /**
     * Rounded rectangle bar; the bar fills from left to right, determined by the {@link Bar.value}, similar to a standard progress bar.
     */
    BarSubType[BarSubType["Groove"] = 4] = "Groove";
})(BarSubType || (BarSubType = {}));

/**
 * Defines the type of argument supplied by Stream Deck.
 */
var RegistrationParameter;
(function (RegistrationParameter) {
    /**
     * Identifies the argument that specifies the web socket port that Stream Deck is listening on.
     */
    RegistrationParameter["Port"] = "-port";
    /**
     * Identifies the argument that supplies information about the Stream Deck and the plugin.
     */
    RegistrationParameter["Info"] = "-info";
    /**
     * Identifies the argument that specifies the unique identifier that can be used when registering the plugin.
     */
    RegistrationParameter["PluginUUID"] = "-pluginUUID";
    /**
     * Identifies the argument that specifies the event to be sent to Stream Deck as part of the registration procedure.
     */
    RegistrationParameter["RegisterEvent"] = "-registerEvent";
})(RegistrationParameter || (RegistrationParameter = {}));

/**
 * Defines the target of a request, i.e. whether the request should update the Stream Deck hardware, Stream Deck software (application), or both, when calling `setImage` and `setState`.
 */
var Target;
(function (Target) {
    /**
     * Hardware and software should be updated as part of the request.
     */
    Target[Target["HardwareAndSoftware"] = 0] = "HardwareAndSoftware";
    /**
     * Hardware only should be updated as part of the request.
     */
    Target[Target["Hardware"] = 1] = "Hardware";
    /**
     * Software only should be updated as part of the request.
     */
    Target[Target["Software"] = 2] = "Software";
})(Target || (Target = {}));

/**
 * Provides information for a version, as parsed from a string denoted as a collection of numbers separated by a period, for example `1.45.2`, `4.0.2.13098`. Parsing is opinionated
 * and strings should strictly conform to the format `{major}[.{minor}[.{patch}[.{build}]]]`; version numbers that form the version are optional, and when `undefined` will default to
 * 0, for example the `minor`, `patch`, or `build` number may be omitted.
 *
 * NB: This implementation should be considered fit-for-purpose, and should be used sparing.
 */
class Version {
    /**
     * Build version number.
     */
    build;
    /**
     * Major version number.
     */
    major;
    /**
     * Minor version number.
     */
    minor;
    /**
     * Patch version number.
     */
    patch;
    /**
     * Initializes a new instance of the {@link Version} class.
     * @param value Value to parse the version from.
     */
    constructor(value) {
        const result = value.match(/^(0|[1-9]\d*)(?:\.(0|[1-9]\d*))?(?:\.(0|[1-9]\d*))?(?:\.(0|[1-9]\d*))?$/);
        if (result === null) {
            throw new Error(`Invalid format; expected "{major}[.{minor}[.{patch}[.{build}]]]" but was "${value}"`);
        }
        [, this.major, this.minor, this.patch, this.build] = [...result.map((value) => parseInt(value) || 0)];
    }
    /**
     * Compares this instance to the {@link other} {@link Version}.
     * @param other The {@link Version} to compare to.
     * @returns `-1` when this instance is less than the {@link other}, `1` when this instance is greater than {@link other}, otherwise `0`.
     */
    compareTo(other) {
        const segments = ({ major, minor, build, patch }) => [major, minor, build, patch];
        const thisSegments = segments(this);
        const otherSegments = segments(other);
        for (let i = 0; i < 4; i++) {
            if (thisSegments[i] < otherSegments[i]) {
                return -1;
            }
            else if (thisSegments[i] > otherSegments[i]) {
                return 1;
            }
        }
        return 0;
    }
    /** @inheritdoc */
    toString() {
        return `${this.major}.${this.minor}`;
    }
}

/**
 * Provides a {@link LogTarget} that logs to the console.
 */
class ConsoleTarget {
    /**
     * @inheritdoc
     */
    write(entry) {
        switch (entry.level) {
            case "error":
                console.error(...entry.data);
                break;
            case "warn":
                console.warn(...entry.data);
                break;
            default:
                console.log(...entry.data);
        }
    }
}

// Remove any dependencies on node.
const EOL = "\n";
/**
 * Creates a new string log entry formatter.
 * @param opts Options that defines the type for the formatter.
 * @returns The string {@link LogEntryFormatter}.
 */
function stringFormatter(opts) {
    {
        return (entry) => {
            const { data, level, scope } = entry;
            let prefix = `${new Date().toISOString()} ${level.toUpperCase().padEnd(5)} `;
            if (scope) {
                prefix += `${scope}: `;
            }
            return `${prefix}${reduce(data)}`;
        };
    }
}
/**
 * Stringifies the provided data parameters that make up the log entry.
 * @param data Data parameters.
 * @returns The data represented as a single `string`.
 */
function reduce(data) {
    let result = "";
    let previousWasError = false;
    for (const value of data) {
        // When the value is an error, write the stack.
        if (typeof value === "object" && value instanceof Error) {
            result += `${EOL}${value.stack}`;
            previousWasError = true;
            continue;
        }
        // When the previous was an error, write a new line.
        if (previousWasError) {
            result += EOL;
            previousWasError = false;
        }
        result += typeof value === "object" ? JSON.stringify(value) : value;
        result += " ";
    }
    return result.trimEnd();
}

/* eslint-disable @typescript-eslint/sort-type-constituents */
/**
 * Gets the priority of the specified log level as a number; low numbers signify a higher priority.
 * @param level Log level.
 * @returns The priority as a number.
 */
function defcon(level) {
    switch (level) {
        case "error":
            return 0;
        case "warn":
            return 1;
        case "info":
            return 2;
        case "debug":
            return 3;
        case "trace":
        default:
            return 4;
    }
}

/**
 * Logger capable of forwarding messages to a {@link LogTarget}.
 */
class Logger {
    /**
     * Backing field for the {@link Logger.level}.
     */
    #level;
    /**
     * Options that define the loggers behavior.
     */
    #options;
    /**
     * Scope associated with this {@link Logger}.
     */
    #scope;
    /**
     * Initializes a new instance of the {@link Logger} class.
     * @param opts Options that define the loggers behavior.
     */
    constructor(opts) {
        this.#options = { minimumLevel: "trace", ...opts };
        this.#scope = this.#options.scope === undefined || this.#options.scope.trim() === "" ? "" : this.#options.scope;
        if (typeof this.#options.level !== "function") {
            this.setLevel(this.#options.level);
        }
    }
    /**
     * Gets the {@link LogLevel}.
     * @returns The {@link LogLevel}.
     */
    get level() {
        if (this.#level !== undefined) {
            return this.#level;
        }
        return typeof this.#options.level === "function" ? this.#options.level() : this.#options.level;
    }
    /**
     * Creates a scoped logger with the given {@link scope}; logs created by scoped-loggers include their scope to enable their source to be easily identified.
     * @param scope Value that represents the scope of the new logger.
     * @returns The scoped logger, or this instance when {@link scope} is not defined.
     */
    createScope(scope) {
        scope = scope.trim();
        if (scope === "") {
            return this;
        }
        return new Logger({
            ...this.#options,
            level: () => this.level,
            scope: this.#options.scope ? `${this.#options.scope}->${scope}` : scope,
        });
    }
    /**
     * Writes the arguments as a debug log entry.
     * @param data Message or data to log.
     * @returns This instance for chaining.
     */
    debug(...data) {
        return this.write({ level: "debug", data, scope: this.#scope });
    }
    /**
     * Writes the arguments as error log entry.
     * @param data Message or data to log.
     * @returns This instance for chaining.
     */
    error(...data) {
        return this.write({ level: "error", data, scope: this.#scope });
    }
    /**
     * Writes the arguments as an info log entry.
     * @param data Message or data to log.
     * @returns This instance for chaining.
     */
    info(...data) {
        return this.write({ level: "info", data, scope: this.#scope });
    }
    /**
     * Sets the log-level that determines which logs should be written. The specified level will be inherited by all scoped loggers unless they have log-level explicitly defined.
     * @param level The log-level that determines which logs should be written; when `undefined`, the level will be inherited from the parent logger, or default to the environment level.
     * @returns This instance for chaining.
     */
    setLevel(level) {
        if (level !== undefined && defcon(level) > defcon(this.#options.minimumLevel)) {
            this.#level = "info";
        }
        else {
            this.#level = level;
        }
        return this;
    }
    /**
     * Writes the arguments as a trace log entry.
     * @param data Message or data to log.
     * @returns This instance for chaining.
     */
    trace(...data) {
        return this.write({ level: "trace", data, scope: this.#scope });
    }
    /**
     * Writes the arguments as a warning log entry.
     * @param data Message or data to log.
     * @returns This instance for chaining.
     */
    warn(...data) {
        return this.write({ level: "warn", data, scope: this.#scope });
    }
    /**
     * Writes the log entry.
     * @param entry Log entry to write.
     * @returns This instance for chaining.
     */
    write(entry) {
        if (defcon(entry.level) <= defcon(this.level)) {
            this.#options.targets.forEach((t) => t.write(entry));
        }
        return this;
    }
}

/**
 * Provides a {@link LogTarget} capable of logging to a local file system.
 */
class FileTarget {
    /**
     * File path where logs will be written.
     */
    #filePath;
    /**
     * Options that defines how logs should be written to the local file system.
     */
    #options;
    /**
     * Current size of the logs that have been written to the {@link FileTarget.#filePath}.
     */
    #size = 0;
    /**
     * Initializes a new instance of the {@link FileTarget} class.
     * @param options Options that defines how logs should be written to the local file system.
     */
    constructor(options) {
        this.#options = options;
        this.#filePath = this.getLogFilePath();
        this.reIndex();
    }
    /**
     * @inheritdoc
     */
    write(entry) {
        const fd = fs.openSync(this.#filePath, "a");
        try {
            const msg = this.#options.format(entry);
            fs.writeSync(fd, msg + "\n");
            this.#size += msg.length;
        }
        finally {
            fs.closeSync(fd);
        }
        if (this.#size >= this.#options.maxSize) {
            this.reIndex();
            this.#size = 0;
        }
    }
    /**
     * Gets the file path to an indexed log file.
     * @param index Optional index of the log file to be included as part of the file name.
     * @returns File path that represents the indexed log file.
     */
    getLogFilePath(index = 0) {
        return path.join(this.#options.dest, `${this.#options.fileName}.${index}.log`);
    }
    /**
     * Gets the log files associated with this file target, including past and present.
     * @returns Log file entries.
     */
    getLogFiles() {
        const regex = /^\.(\d+)\.log$/;
        return fs
            .readdirSync(this.#options.dest, { withFileTypes: true })
            .reduce((prev, entry) => {
            if (entry.isDirectory() || entry.name.indexOf(this.#options.fileName) < 0) {
                return prev;
            }
            const match = entry.name.substring(this.#options.fileName.length).match(regex);
            if (match?.length !== 2) {
                return prev;
            }
            prev.push({
                path: path.join(this.#options.dest, entry.name),
                index: parseInt(match[1]),
            });
            return prev;
        }, [])
            .sort(({ index: a }, { index: b }) => {
            return a < b ? -1 : a > b ? 1 : 0;
        });
    }
    /**
     * Re-indexes the existing log files associated with this file target, removing old log files whose index exceeds the {@link FileTargetOptions.maxFileCount}, and renaming the
     * remaining log files, leaving index "0" free for a new log file.
     */
    reIndex() {
        // When the destination directory is new, create it, and return.
        if (!fs.existsSync(this.#options.dest)) {
            fs.mkdirSync(this.#options.dest);
            return;
        }
        const logFiles = this.getLogFiles();
        for (let i = logFiles.length - 1; i >= 0; i--) {
            const log = logFiles[i];
            if (i >= this.#options.maxFileCount - 1) {
                fs.rmSync(log.path);
            }
            else {
                fs.renameSync(log.path, this.getLogFilePath(i + 1));
            }
        }
    }
}

let __isDebugMode = undefined;
/**
 * Determines whether the current plugin is running in a debug environment; this is determined by the command-line arguments supplied to the plugin by Stream. Specifically, the result
 * is `true` when  either `--inspect`, `--inspect-brk` or `--inspect-port` are present as part of the processes' arguments.
 * @returns `true` when the plugin is running in debug mode; otherwise `false`.
 */
function isDebugMode() {
    if (__isDebugMode === undefined) {
        __isDebugMode = process.execArgv.some((arg) => {
            const name = arg.split("=")[0];
            return name === "--inspect" || name === "--inspect-brk" || name === "--inspect-port";
        });
    }
    return __isDebugMode;
}
/**
 * Gets the plugin's unique-identifier from the current working directory.
 * @returns The plugin's unique-identifier.
 */
function getPluginUUID() {
    const name = path.basename(process.cwd());
    const suffixIndex = name.lastIndexOf(".sdPlugin");
    return suffixIndex < 0 ? name : name.substring(0, suffixIndex);
}

// Log all entires to a log file.
const fileTarget = new FileTarget({
    dest: path.join(cwd(), "logs"),
    fileName: getPluginUUID(),
    format: stringFormatter(),
    maxFileCount: 10,
    maxSize: 50 * 1024 * 1024,
});
// Construct the log targets.
const targets = [fileTarget];
if (isDebugMode()) {
    targets.splice(0, 0, new ConsoleTarget());
}
/**
 * Logger responsible for capturing log messages.
 */
const logger = new Logger({
    level: isDebugMode() ? "debug" : "info",
    minimumLevel: isDebugMode() ? "trace" : "debug",
    targets,
});
process.once("uncaughtException", (err) => logger.error("Process encountered uncaught exception", err));

/**
 * Provides a connection between the plugin and the Stream Deck allowing for messages to be sent and received.
 */
class Connection extends EventEmitter {
    /**
     * Private backing field for {@link Connection.registrationParameters}.
     */
    _registrationParameters;
    /**
     * Private backing field for {@link Connection.version}.
     */
    _version;
    /**
     * Used to ensure {@link Connection.connect} is invoked as a singleton; `false` when a connection is occurring or established.
     */
    canConnect = true;
    /**
     * Underlying web socket connection.
     */
    connection = withResolvers();
    /**
     * Logger scoped to the connection.
     */
    logger = logger.createScope("Connection");
    /**
     * Underlying connection information provided to the plugin to establish a connection with Stream Deck.
     * @returns The registration parameters.
     */
    get registrationParameters() {
        return (this._registrationParameters ??= this.getRegistrationParameters());
    }
    /**
     * Version of Stream Deck this instance is connected to.
     * @returns The version.
     */
    get version() {
        return (this._version ??= new Version(this.registrationParameters.info.application.version));
    }
    /**
     * Establishes a connection with the Stream Deck, allowing for the plugin to send and receive messages.
     * @returns A promise that is resolved when a connection has been established.
     */
    async connect() {
        // Ensure we only establish a single connection.
        if (this.canConnect) {
            this.canConnect = false;
            const webSocket = new WebSocket(`ws://127.0.0.1:${this.registrationParameters.port}`);
            webSocket.onmessage = (ev) => this.tryEmit(ev);
            webSocket.onopen = () => {
                webSocket.send(JSON.stringify({
                    event: this.registrationParameters.registerEvent,
                    uuid: this.registrationParameters.pluginUUID,
                }));
                // Web socket established a connection with the Stream Deck and the plugin was registered.
                this.connection.resolve(webSocket);
                this.emit("connected", this.registrationParameters.info);
            };
        }
        await this.connection.promise;
    }
    /**
     * Sends the commands to the Stream Deck, once the connection has been established and registered.
     * @param command Command being sent.
     * @returns `Promise` resolved when the command is sent to Stream Deck.
     */
    async send(command) {
        const connection = await this.connection.promise;
        const message = JSON.stringify(command);
        this.logger.trace(message);
        connection.send(message);
    }
    /**
     * Gets the registration parameters, provided by Stream Deck, that provide information to the plugin, including how to establish a connection.
     * @returns Parsed registration parameters.
     */
    getRegistrationParameters() {
        const params = {
            port: undefined,
            info: undefined,
            pluginUUID: undefined,
            registerEvent: undefined,
        };
        const scopedLogger = logger.createScope("RegistrationParameters");
        for (let i = 0; i < process.argv.length - 1; i++) {
            const param = process.argv[i];
            const value = process.argv[++i];
            switch (param) {
                case RegistrationParameter.Port:
                    scopedLogger.debug(`port=${value}`);
                    params.port = value;
                    break;
                case RegistrationParameter.PluginUUID:
                    scopedLogger.debug(`pluginUUID=${value}`);
                    params.pluginUUID = value;
                    break;
                case RegistrationParameter.RegisterEvent:
                    scopedLogger.debug(`registerEvent=${value}`);
                    params.registerEvent = value;
                    break;
                case RegistrationParameter.Info:
                    scopedLogger.debug(`info=${value}`);
                    params.info = JSON.parse(value);
                    break;
                default:
                    i--;
                    break;
            }
        }
        const invalidArgs = [];
        const validate = (name, value) => {
            if (value === undefined) {
                invalidArgs.push(name);
            }
        };
        validate(RegistrationParameter.Port, params.port);
        validate(RegistrationParameter.PluginUUID, params.pluginUUID);
        validate(RegistrationParameter.RegisterEvent, params.registerEvent);
        validate(RegistrationParameter.Info, params.info);
        if (invalidArgs.length > 0) {
            throw new Error(`Unable to establish a connection with Stream Deck, missing command line arguments: ${invalidArgs.join(", ")}`);
        }
        return params;
    }
    /**
     * Attempts to emit the {@link ev} that was received from the {@link Connection.connection}.
     * @param ev Event message data received from Stream Deck.
     */
    tryEmit(ev) {
        try {
            const message = JSON.parse(ev.data.toString());
            if (message.event) {
                this.logger.trace(ev.data.toString());
                this.emit(message.event, message);
            }
            else {
                this.logger.warn(`Received unknown message: ${ev.data}`);
            }
        }
        catch (err) {
            this.logger.error(`Failed to parse message: ${ev.data}`, err);
        }
    }
}
const connection = new Connection();

/**
 * Provides information for events received from Stream Deck.
 */
class Event {
    /**
     * Event that occurred.
     */
    type;
    /**
     * Initializes a new instance of the {@link Event} class.
     * @param source Source of the event, i.e. the original message from Stream Deck.
     */
    constructor(source) {
        this.type = source.event;
    }
}

/**
 * Provides information for an event relating to an action.
 */
class ActionWithoutPayloadEvent extends Event {
    action;
    /**
     * Initializes a new instance of the {@link ActionWithoutPayloadEvent} class.
     * @param action Action that raised the event.
     * @param source Source of the event, i.e. the original message from Stream Deck.
     */
    constructor(action, source) {
        super(source);
        this.action = action;
    }
}
/**
 * Provides information for an event relating to an action.
 */
class ActionEvent extends ActionWithoutPayloadEvent {
    /**
     * Provides additional information about the event that occurred, e.g. how many `ticks` the dial was rotated, the current `state` of the action, etc.
     */
    payload;
    /**
     * Initializes a new instance of the {@link ActionEvent} class.
     * @param action Action that raised the event.
     * @param source Source of the event, i.e. the original message from Stream Deck.
     */
    constructor(action, source) {
        super(action, source);
        this.payload = source.payload;
    }
}

const manifest$1 = new Lazy(() => {
    const path = join(process.cwd(), "manifest.json");
    if (!existsSync(path)) {
        throw new Error("Failed to read manifest.json as the file does not exist.");
    }
    try {
        return JSON.parse(readFileSync(path, {
            encoding: "utf-8",
            flag: "r",
        }).toString());
    }
    catch (e) {
        if (e instanceof SyntaxError) {
            return null;
        }
        else {
            throw e;
        }
    }
});
const softwareMinimumVersion = new Lazy(() => {
    if (manifest$1.value === null) {
        return null;
    }
    return new Version(manifest$1.value.Software.MinimumVersion);
});
/**
 * Gets the SDK version that the plugin requires.
 * @returns SDK version; otherwise `null` when the plugin is DRM protected.
 */
function getSDKVersion() {
    return manifest$1.value?.SDKVersion ?? null;
}
/**
 * Gets the minimum version that the plugin requires.
 * @returns Minimum required version; otherwise `null` when the plugin is DRM protected.
 */
function getSoftwareMinimumVersion() {
    return softwareMinimumVersion.value;
}
/**
 * Gets the manifest associated with the plugin.
 * @returns The manifest; otherwise `null` when the plugin is DRM protected.
 */
function getManifest() {
    return manifest$1.value;
}

const __items$1 = new Map();
/**
 * Provides a read-only store of Stream Deck devices.
 */
class ReadOnlyActionStore extends Enumerable {
    /**
     * Initializes a new instance of the {@link ReadOnlyActionStore}.
     */
    constructor() {
        super(__items$1);
    }
    /**
     * Gets the action with the specified identifier.
     * @param id Identifier of action to search for.
     * @returns The action, when present; otherwise `undefined`.
     */
    getActionById(id) {
        return __items$1.get(id);
    }
}
/**
 * Provides a store of Stream Deck actions.
 */
class ActionStore extends ReadOnlyActionStore {
    /**
     * Deletes the action from the store.
     * @param id The action's identifier.
     */
    delete(id) {
        __items$1.delete(id);
    }
    /**
     * Adds the action to the store.
     * @param action The action.
     */
    set(action) {
        __items$1.set(action.id, action);
    }
}
/**
 * Singleton instance of the action store.
 */
const actionStore = new ActionStore();

/**
 * Provides information for events relating to an application.
 */
class ApplicationEvent extends Event {
    /**
     * Monitored application that was launched/terminated.
     */
    application;
    /**
     * Initializes a new instance of the {@link ApplicationEvent} class.
     * @param source Source of the event, i.e. the original message from Stream Deck.
     */
    constructor(source) {
        super(source);
        this.application = source.payload.application;
    }
}

/**
 * Provides information for events relating to a device.
 */
class DeviceEvent extends Event {
    device;
    /**
     * Initializes a new instance of the {@link DeviceEvent} class.
     * @param source Source of the event, i.e. the original message from Stream Deck.
     * @param device Device that event is associated with.
     */
    constructor(source, device) {
        super(source);
        this.device = device;
    }
}

/**
 * Event information received from Stream Deck as part of a deep-link message being routed to the plugin.
 */
class DidReceiveDeepLinkEvent extends Event {
    /**
     * Deep-link URL routed from Stream Deck.
     */
    url;
    /**
     * Initializes a new instance of the {@link DidReceiveDeepLinkEvent} class.
     * @param source Source of the event, i.e. the original message from Stream Deck.
     */
    constructor(source) {
        super(source);
        this.url = new DeepLinkURL(source.payload.url);
    }
}
const PREFIX = "streamdeck://";
/**
 * Provides information associated with a URL received as part of a deep-link message, conforming to the URI syntax defined within RFC-3986 (https://datatracker.ietf.org/doc/html/rfc3986#section-3).
 */
class DeepLinkURL {
    /**
     * Fragment of the URL, with the number sign (#) omitted. For example, a URL of "/test#heading" would result in a {@link DeepLinkURL.fragment} of "heading".
     */
    fragment;
    /**
     * Original URL. For example, a URL of "/test?one=two#heading" would result in a {@link DeepLinkURL.href} of "/test?one=two#heading".
     */
    href;
    /**
     * Path of the URL; the full URL with the query and fragment omitted. For example, a URL of "/test?one=two#heading" would result in a {@link DeepLinkURL.path} of "/test".
     */
    path;
    /**
     * Query of the URL, with the question mark (?) omitted. For example, a URL of "/test?name=elgato&key=123" would result in a {@link DeepLinkURL.query} of "name=elgato&key=123".
     * See also {@link DeepLinkURL.queryParameters}.
     */
    query;
    /**
     * Query string parameters parsed from the URL. See also {@link DeepLinkURL.query}.
     */
    queryParameters;
    /**
     * Initializes a new instance of the {@link DeepLinkURL} class.
     * @param url URL of the deep-link, with the schema and authority omitted.
     */
    constructor(url) {
        const refUrl = new URL(`${PREFIX}${url}`);
        this.fragment = refUrl.hash.substring(1);
        this.href = refUrl.href.substring(PREFIX.length);
        this.path = DeepLinkURL.parsePath(this.href);
        this.query = refUrl.search.substring(1);
        this.queryParameters = refUrl.searchParams;
    }
    /**
     * Parses the {@link DeepLinkURL.path} from the specified {@link href}.
     * @param href Partial URL that contains the path to parse.
     * @returns The path of the URL.
     */
    static parsePath(href) {
        const indexOf = (char) => {
            const index = href.indexOf(char);
            return index >= 0 ? index : href.length;
        };
        return href.substring(0, Math.min(indexOf("?"), indexOf("#")));
    }
}

/**
 * Provides event information for when the plugin received the global settings.
 */
class DidReceiveGlobalSettingsEvent extends Event {
    /**
     * Settings associated with the event.
     */
    settings;
    /**
     * Initializes a new instance of the {@link DidReceiveGlobalSettingsEvent} class.
     * @param source Source of the event, i.e. the original message from Stream Deck.
     */
    constructor(source) {
        super(source);
        this.settings = source.payload.settings;
    }
}

/**
 * Provides information for an event triggered by a message being sent to the plugin, from the property inspector.
 */
class SendToPluginEvent extends Event {
    action;
    /**
     * Payload sent from the property inspector.
     */
    payload;
    /**
     * Initializes a new instance of the {@link SendToPluginEvent} class.
     * @param action Action that raised the event.
     * @param source Source of the event, i.e. the original message from Stream Deck.
     */
    constructor(action, source) {
        super(source);
        this.action = action;
        this.payload = source.payload;
    }
}

/**
 * Validates the `SDKVersion` within the manifest fulfils the minimum required version for the specified
 * feature; when the version is not fulfilled, an error is thrown with the feature formatted into the message.
 * @param minimumVersion Minimum required SDKVersion.
 * @param feature Feature that requires the version.
 */
function requiresSDKVersion(minimumVersion, feature) {
    const sdkVersion = getSDKVersion();
    if (sdkVersion !== null && minimumVersion > sdkVersion) {
        throw new Error(`[ERR_NOT_SUPPORTED]: ${feature} requires manifest SDK version ${minimumVersion} or higher, but found version ${sdkVersion}; please update the "SDKVersion" in the plugin's manifest to ${minimumVersion} or higher.`);
    }
}
/**
 * Validates the {@link streamDeckVersion} and manifest's `Software.MinimumVersion` are at least the {@link minimumVersion};
 * when the version is not fulfilled, an error is thrown with the {@link feature} formatted into the message.
 * @param minimumVersion Minimum required version.
 * @param streamDeckVersion Actual application version.
 * @param feature Feature that requires the version.
 */
function requiresVersion(minimumVersion, streamDeckVersion, feature) {
    const required = {
        major: Math.floor(minimumVersion),
        minor: Number(minimumVersion.toString().split(".").at(1) ?? 0), // Account for JavaScript's floating point precision.
        patch: 0,
        build: 0,
    };
    if (streamDeckVersion.compareTo(required) === -1) {
        throw new Error(`[ERR_NOT_SUPPORTED]: ${feature} requires Stream Deck version ${required.major}.${required.minor} or higher, but current version is ${streamDeckVersion.major}.${streamDeckVersion.minor}; please update Stream Deck and the "Software.MinimumVersion" in the plugin's manifest to "${required.major}.${required.minor}" or higher.`);
    }
    const softwareMinimumVersion = getSoftwareMinimumVersion();
    if (softwareMinimumVersion !== null && softwareMinimumVersion.compareTo(required) === -1) {
        throw new Error(`[ERR_NOT_SUPPORTED]: ${feature} requires Stream Deck version ${required.major}.${required.minor} or higher; please update the "Software.MinimumVersion" in the plugin's manifest to "${required.major}.${required.minor}" or higher.`);
    }
}

let __useExperimentalMessageIdentifiers = false;
const settings = {
    /**
     * Available from Stream Deck 7.1; determines whether message identifiers should be sent when getting
     * action-instance or global settings.
     *
     * When `true`, the did-receive events associated with settings are only emitted when the action-instance
     * or global settings are changed in the property inspector.
     * @returns The value.
     */
    get useExperimentalMessageIdentifiers() {
        return __useExperimentalMessageIdentifiers;
    },
    /**
     * Available from Stream Deck 7.1; determines whether message identifiers should be sent when getting
     * action-instance or global settings.
     *
     * When `true`, the did-receive events associated with settings are only emitted when the action-instance
     * or global settings are changed in the property inspector.
     */
    set useExperimentalMessageIdentifiers(value) {
        requiresVersion(7.1, connection.version, "Message identifiers");
        __useExperimentalMessageIdentifiers = value;
    },
    /**
     * Gets the global settings associated with the plugin.
     * @template T The type of global settings associated with the plugin.
     * @returns Promise containing the plugin's global settings.
     */
    getGlobalSettings: () => {
        return new Promise((resolve) => {
            connection.once("didReceiveGlobalSettings", (ev) => resolve(ev.payload.settings));
            connection.send({
                event: "getGlobalSettings",
                context: connection.registrationParameters.pluginUUID,
                id: randomUUID(),
            });
        });
    },
    /**
     * Occurs when the global settings are requested, or when the the global settings were updated in
     * the property inspector.
     * @template T The type of settings associated with the action.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that removes the listener.
     */
    onDidReceiveGlobalSettings: (listener) => {
        return connection.disposableOn("didReceiveGlobalSettings", (ev) => {
            // Do nothing when the global settings were requested.
            if (settings.useExperimentalMessageIdentifiers && ev.id) {
                return;
            }
            listener(new DidReceiveGlobalSettingsEvent(ev));
        });
    },
    /**
     * Occurs when the settings associated with an action instance are requested, or when the the settings
     * were updated in the property inspector.
     * @template T The type of settings associated with the action.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that removes the listener.
     */
    onDidReceiveSettings: (listener) => {
        return connection.disposableOn("didReceiveSettings", (ev) => {
            // Do nothing when the action's settings were requested.
            if (settings.useExperimentalMessageIdentifiers && ev.id) {
                return;
            }
            const action = actionStore.getActionById(ev.context);
            if (action) {
                listener(new ActionEvent(action, ev));
            }
        });
    },
    /**
     * Sets the global settings associated the plugin; these settings are only available to this plugin,
     * and should be used to persist information securely.
     * @param settings Settings to save.
     * @example
     * streamDeck.settings.setGlobalSettings({
     *   apiKey,
     *   connectedDate: new Date()
     * })
     */
    setGlobalSettings: async (settings) => {
        await connection.send({
            event: "setGlobalSettings",
            context: connection.registrationParameters.pluginUUID,
            payload: settings,
        });
    },
};

/**
 * Controller capable of sending/receiving payloads with the property inspector, and listening for events.
 */
class UIController {
    /**
     * Action associated with the current property inspector.
     */
    #action;
    /**
     * To overcome event races, the debounce counter keeps track of appear vs disappear events, ensuring
     * we only clear the current ui when an equal number of matching disappear events occur.
     */
    #appearanceStackCount = 0;
    /**
     * Initializes a new instance of the {@link UIController} class.
     */
    constructor() {
        // Track the action for the current property inspector.
        this.onDidAppear((ev) => {
            if (this.#isCurrent(ev.action)) {
                this.#appearanceStackCount++;
            }
            else {
                this.#appearanceStackCount = 1;
                this.#action = ev.action;
            }
        });
        this.onDidDisappear((ev) => {
            if (this.#isCurrent(ev.action)) {
                this.#appearanceStackCount--;
                if (this.#appearanceStackCount <= 0) {
                    this.#action = undefined;
                }
            }
        });
    }
    /**
     * Gets the action associated with the current property.
     * @returns The action; otherwise `undefined` when a property inspector is not visible.
     */
    get action() {
        return this.#action;
    }
    /**
     * Occurs when the property inspector associated with the action becomes visible, i.e. the user
     * selected an action in the Stream Deck application..
     * @template T The type of settings associated with the action.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that, when disposed, removes the listener.
     */
    onDidAppear(listener) {
        return connection.disposableOn("propertyInspectorDidAppear", (ev) => {
            const action = actionStore.getActionById(ev.context);
            if (action) {
                listener(new ActionWithoutPayloadEvent(action, ev));
            }
        });
    }
    /**
     * Occurs when the property inspector associated with the action disappears, i.e. the user unselected
     * the action in the Stream Deck application.
     * @template T The type of settings associated with the action.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that, when disposed, removes the listener.
     */
    onDidDisappear(listener) {
        return connection.disposableOn("propertyInspectorDidDisappear", (ev) => {
            const action = actionStore.getActionById(ev.context);
            if (action) {
                listener(new ActionWithoutPayloadEvent(action, ev));
            }
        });
    }
    /**
     * Occurs when a message was sent to the plugin _from_ the property inspector.
     * @template TPayload The type of the payload received from the property inspector.
     * @template TSettings The type of settings associated with the action.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that, when disposed, removes the listener.
     */
    onSendToPlugin(listener) {
        return connection.disposableOn("sendToPlugin", (ev) => {
            const action = actionStore.getActionById(ev.context);
            if (action) {
                listener(new SendToPluginEvent(action, ev));
            }
        });
    }
    /**
     * Sends the payload to the property inspector; the payload is only sent when the property inspector
     * is visible for an action provided by this plugin.
     * @param payload Payload to send.
     */
    async sendToPropertyInspector(payload) {
        if (this.#action) {
            await connection.send({
                event: "sendToPropertyInspector",
                context: this.#action.id,
                payload,
            });
        }
    }
    /**
     * Determines whether the specified action is the action for the current property inspector.
     * @param action Action to check against.
     * @returns `true` when the actions are the same.
     */
    #isCurrent(action) {
        return (this.#action?.id === action.id &&
            this.#action?.manifestId === action.manifestId &&
            this.#action?.device?.id === action.device.id);
    }
}
const ui = new UIController();

const __items = new Map();
/**
 * Provides a read-only store of Stream Deck devices.
 */
class ReadOnlyDeviceStore extends Enumerable {
    /**
     * Initializes a new instance of the {@link ReadOnlyDeviceStore}.
     */
    constructor() {
        super(__items);
    }
    /**
     * Gets the Stream Deck {@link Device} associated with the specified {@link deviceId}.
     * @param deviceId Identifier of the Stream Deck device.
     * @returns The Stream Deck device information; otherwise `undefined` if a device with the {@link deviceId} does not exist.
     */
    getDeviceById(deviceId) {
        return __items.get(deviceId);
    }
}
/**
 * Provides a store of Stream Deck devices.
 */
class DeviceStore extends ReadOnlyDeviceStore {
    /**
     * Adds the device to the store.
     * @param device The device.
     */
    set(device) {
        __items.set(device.id, device);
    }
}
/**
 * Singleton instance of the device store.
 */
const deviceStore = new DeviceStore();

/**
 * Provides information about an instance of a Stream Deck action.
 */
class ActionContext {
    /**
     * Device the action is associated with.
     */
    #device;
    /**
     * Source of the action.
     */
    #source;
    /**
     * Initializes a new instance of the {@link ActionContext} class.
     * @param source Source of the action.
     */
    constructor(source) {
        this.#source = source;
        const device = deviceStore.getDeviceById(source.device);
        if (!device) {
            throw new Error(`Failed to initialize action; device ${source.device} not found`);
        }
        this.#device = device;
    }
    /**
     * Type of the action.
     * - `Keypad` is a key.
     * - `Encoder` is a dial and portion of the touch strip.
     * @returns Controller type.
     */
    get controllerType() {
        return this.#source.payload.controller;
    }
    /**
     * Stream Deck device the action is positioned on.
     * @returns Stream Deck device.
     */
    get device() {
        return this.#device;
    }
    /**
     * Action instance identifier.
     * @returns Identifier.
     */
    get id() {
        return this.#source.context;
    }
    /**
     * Manifest identifier (UUID) for this action type.
     * @returns Manifest identifier.
     */
    get manifestId() {
        return this.#source.action;
    }
    /**
     * Converts this instance to a serializable object.
     * @returns The serializable object.
     */
    toJSON() {
        return {
            controllerType: this.controllerType,
            device: this.device,
            id: this.id,
            manifestId: this.manifestId,
        };
    }
}

const REQUEST_TIMEOUT = 15 * 1000; // 15s
/**
 * Provides a contextualized instance of an {@link Action}, allowing for direct communication with the Stream Deck.
 * @template T The type of settings associated with the action.
 */
class Action extends ActionContext {
    /**
     * Gets the resources (files) associated with this action; these resources are embedded into the
     * action when it is exported, either individually, or as part of a profile.
     *
     * Available from Stream Deck 7.1.
     * @returns The resources.
     */
    async getResources() {
        requiresVersion(7.1, connection.version, "getResources");
        const res = await this.#fetch("getResources", "didReceiveResources");
        return res.payload.resources;
    }
    /**
     * Gets the settings associated this action instance.
     * @template U The type of settings associated with the action.D
     * @returns Promise containing the action instance's settings.
     */
    async getSettings() {
        const res = await this.#fetch("getSettings", "didReceiveSettings");
        return res.payload.settings;
    }
    /**
     * Determines whether this instance is a dial.
     * @returns `true` when this instance is a dial; otherwise `false`.
     */
    isDial() {
        return this.controllerType === "Encoder";
    }
    /**
     * Determines whether this instance is a key.
     * @returns `true` when this instance is a key; otherwise `false`.
     */
    isKey() {
        return this.controllerType === "Keypad";
    }
    /**
     * Sets the resources (files) associated with this action; these resources are embedded into the
     * action when it is exported, either individually, or as part of a profile.
     *
     * Available from Stream Deck 7.1.
     * @example
     * action.setResources({
     *   fileOne: "c:\\hello-world.txt",
     *   anotherFile: "c:\\icon.png"
     * });
     * @param resources The resources as a map of file paths.
     * @returns `Promise` resolved when the resources are saved to Stream Deck.
     */
    setResources(resources) {
        requiresVersion(7.1, connection.version, "setResources");
        return connection.send({
            event: "setResources",
            context: this.id,
            payload: resources,
        });
    }
    /**
     * Sets the {@link settings} associated with this action instance. Use in conjunction with {@link Action.getSettings}.
     * @param settings Settings to persist.
     * @returns `Promise` resolved when the {@link settings} are sent to Stream Deck.
     */
    setSettings(settings) {
        return connection.send({
            event: "setSettings",
            context: this.id,
            payload: settings,
        });
    }
    /**
     * Temporarily shows an alert (i.e. warning), in the form of an exclamation mark in a yellow triangle, on this action instance. Used to provide visual feedback when an action failed.
     * @returns `Promise` resolved when the request to show an alert has been sent to Stream Deck.
     */
    showAlert() {
        return connection.send({
            event: "showAlert",
            context: this.id,
        });
    }
    /**
     * Fetches information from Stream Deck by sending the command, and awaiting the event.
     * @param command Name of the event (command) to send.
     * @param event Name of the event to await.
     * @returns The payload from the received event.
     */
    async #fetch(command, event) {
        const { resolve, reject, promise } = withResolvers();
        // Set a timeout to prevent endless awaiting.
        const timeoutId = setTimeout(() => {
            listener.dispose();
            reject("The request timed out");
        }, REQUEST_TIMEOUT);
        // Listen for an event that can resolve the request.
        const listener = connection.disposableOn(event, (ev) => {
            // Make sure the received event is for this action.
            if (ev.context == this.id) {
                clearTimeout(timeoutId);
                listener.dispose();
                resolve(ev);
            }
        });
        // Send the request; specifying an id signifies its a request.
        await connection.send({
            event: command,
            context: this.id,
            id: randomUUID(),
        });
        return promise;
    }
}

/**
 * Provides a contextualized instance of a dial action.
 * @template T The type of settings associated with the action.
 */
class DialAction extends Action {
    /**
     * Private backing field for {@link DialAction.coordinates}.
     */
    #coordinates;
    /**
     * Initializes a new instance of the {@see DialAction} class.
     * @param source Source of the action.
     */
    constructor(source) {
        super(source);
        if (source.payload.controller !== "Encoder") {
            throw new Error("Unable to create DialAction; source event is not a Encoder");
        }
        this.#coordinates = Object.freeze(source.payload.coordinates);
    }
    /**
     * Coordinates of the dial.
     * @returns The coordinates.
     */
    get coordinates() {
        return this.#coordinates;
    }
    /**
     * Sets the feedback for the current layout associated with this action instance, allowing for the visual items to be updated. Layouts are a powerful way to provide dynamic information
     * to users, and can be assigned in the manifest, or dynamically via {@link Action.setFeedbackLayout}.
     *
     * The {@link feedback} payload defines which items within the layout will be updated, and are identified by their property name (defined as the `key` in the layout's definition).
     * The values can either by a complete new definition, a `string` for layout item types of `text` and `pixmap`, or a `number` for layout item types of `bar` and `gbar`.
     * @param feedback Object containing information about the layout items to be updated.
     * @returns `Promise` resolved when the request to set the {@link feedback} has been sent to Stream Deck.
     */
    setFeedback(feedback) {
        return connection.send({
            event: "setFeedback",
            context: this.id,
            payload: feedback,
        });
    }
    /**
     * Sets the layout associated with this action instance. The layout must be either a built-in layout identifier, or path to a local layout JSON file within the plugin's folder.
     * Use in conjunction with {@link Action.setFeedback} to update the layout's current items' settings.
     * @param layout Name of a pre-defined layout, or relative path to a custom one.
     * @returns `Promise` resolved when the new layout has been sent to Stream Deck.
     */
    setFeedbackLayout(layout) {
        return connection.send({
            event: "setFeedbackLayout",
            context: this.id,
            payload: {
                layout,
            },
        });
    }
    /**
     * Sets the {@link image} to be display for this action instance within Stream Deck app.
     *
     * NB: The image can only be set by the plugin when the the user has not specified a custom image.
     * @param image Image to display; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.),
     * or an SVG `string`. When `undefined`, the image from the manifest will be used.
     * @returns `Promise` resolved when the request to set the {@link image} has been sent to Stream Deck.
     */
    setImage(image) {
        return connection.send({
            event: "setImage",
            context: this.id,
            payload: {
                image,
            },
        });
    }
    /**
     * Sets the {@link title} displayed for this action instance.
     *
     * NB: The title can only be set by the plugin when the the user has not specified a custom title.
     * @param title Title to display.
     * @returns `Promise` resolved when the request to set the {@link title} has been sent to Stream Deck.
     */
    setTitle(title) {
        return this.setFeedback({ title });
    }
    /**
     * Sets the trigger (interaction) {@link descriptions} associated with this action instance. Descriptions are shown within the Stream Deck application, and informs the user what
     * will happen when they interact with the action, e.g. rotate, touch, etc. When {@link descriptions} is `undefined`, the descriptions will be reset to the values provided as part
     * of the manifest.
     *
     * NB: Applies to encoders (dials / touchscreens) found on Stream Deck + devices.
     * @param descriptions Descriptions that detail the action's interaction.
     * @returns `Promise` resolved when the request to set the {@link descriptions} has been sent to Stream Deck.
     */
    setTriggerDescription(descriptions) {
        return connection.send({
            event: "setTriggerDescription",
            context: this.id,
            payload: descriptions || {},
        });
    }
    /**
     * @inheritdoc
     */
    toJSON() {
        return {
            ...super.toJSON(),
            coordinates: this.coordinates,
        };
    }
}

/**
 * Provides a contextualized instance of a key action.
 * @template T The type of settings associated with the action.
 */
class KeyAction extends Action {
    /**
     * Private backing field for {@link KeyAction.coordinates}.
     */
    #coordinates;
    /**
     * Source of the action.
     */
    #source;
    /**
     * Initializes a new instance of the {@see KeyAction} class.
     * @param source Source of the action.
     */
    constructor(source) {
        super(source);
        if (source.payload.controller !== "Keypad") {
            throw new Error("Unable to create KeyAction; source event is not a Keypad");
        }
        this.#coordinates = !source.payload.isInMultiAction ? Object.freeze(source.payload.coordinates) : undefined;
        this.#source = source;
    }
    /**
     * Coordinates of the key; otherwise `undefined` when the action is part of a multi-action.
     * @returns The coordinates.
     */
    get coordinates() {
        return this.#coordinates;
    }
    /**
     * Determines whether the key is part of a multi-action.
     * @returns `true` when in a multi-action; otherwise `false`.
     */
    isInMultiAction() {
        return this.#source.payload.isInMultiAction;
    }
    /**
     * Sets the {@link image} to be display for this action instance.
     *
     * NB: The image can only be set by the plugin when the the user has not specified a custom image.
     * @param image Image to display; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.),
     * or an SVG `string`. When `undefined`, the image from the manifest will be used.
     * @param options Additional options that define where and how the image should be rendered.
     * @returns `Promise` resolved when the request to set the {@link image} has been sent to Stream Deck.
     */
    setImage(image, options) {
        return connection.send({
            event: "setImage",
            context: this.id,
            payload: {
                image,
                ...options,
            },
        });
    }
    /**
     * Sets the current {@link state} of this action instance; only applies to actions that have multiple states defined within the manifest.
     * @param state State to set; this be either 0, or 1.
     * @returns `Promise` resolved when the request to set the state of an action instance has been sent to Stream Deck.
     */
    setState(state) {
        return connection.send({
            event: "setState",
            context: this.id,
            payload: {
                state,
            },
        });
    }
    /**
     * Sets the {@link title} displayed for this action instance.
     *
     * NB: The title can only be set by the plugin when the the user has not specified a custom title.
     * @param title Title to display; when `undefined` the title within the manifest will be used.
     * @param options Additional options that define where and how the title should be rendered.
     * @returns `Promise` resolved when the request to set the {@link title} has been sent to Stream Deck.
     */
    setTitle(title, options) {
        return connection.send({
            event: "setTitle",
            context: this.id,
            payload: {
                title,
                ...options,
            },
        });
    }
    /**
     * Temporarily shows an "OK" (i.e. success), in the form of a check-mark in a green circle, on this action instance. Used to provide visual feedback when an action successfully
     * executed.
     * @returns `Promise` resolved when the request to show an "OK" has been sent to Stream Deck.
     */
    showOk() {
        return connection.send({
            event: "showOk",
            context: this.id,
        });
    }
    /**
     * @inheritdoc
     */
    toJSON() {
        return {
            ...super.toJSON(),
            coordinates: this.coordinates,
            isInMultiAction: this.isInMultiAction(),
        };
    }
}

const manifest = new Lazy(() => getManifest());
/**
 * Provides functions, and information, for interacting with Stream Deck actions.
 */
class ActionService extends ReadOnlyActionStore {
    /**
     * Initializes a new instance of the {@link ActionService} class.
     */
    constructor() {
        super();
        // Adds the action to the store.
        connection.prependListener("willAppear", (ev) => {
            const action = ev.payload.controller === "Encoder" ? new DialAction(ev) : new KeyAction(ev);
            actionStore.set(action);
        });
        // Remove the action from the store.
        connection.prependListener("willDisappear", (ev) => actionStore.delete(ev.context));
    }
    /**
     * Occurs when the user presses a dial (Stream Deck +).
     * @template T The type of settings associated with the action.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that, when disposed, removes the listener.
     */
    onDialDown(listener) {
        return connection.disposableOn("dialDown", (ev) => {
            const action = actionStore.getActionById(ev.context);
            if (action?.isDial()) {
                listener(new ActionEvent(action, ev));
            }
        });
    }
    /**
     * Occurs when the user rotates a dial (Stream Deck +).
     * @template T The type of settings associated with the action.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that, when disposed, removes the listener.
     */
    onDialRotate(listener) {
        return connection.disposableOn("dialRotate", (ev) => {
            const action = actionStore.getActionById(ev.context);
            if (action?.isDial()) {
                listener(new ActionEvent(action, ev));
            }
        });
    }
    /**
     * Occurs when the user releases a pressed dial (Stream Deck +).
     * @template T The type of settings associated with the action.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that, when disposed, removes the listener.
     */
    onDialUp(listener) {
        return connection.disposableOn("dialUp", (ev) => {
            const action = actionStore.getActionById(ev.context);
            if (action?.isDial()) {
                listener(new ActionEvent(action, ev));
            }
        });
    }
    /**
     * Occurs when the resources were updated within the property inspector.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that, when disposed, removes the listener.
     */
    onDidReceiveResources(listener) {
        return connection.disposableOn("didReceiveResources", (ev) => {
            // When the id is defined, the resources were requested, so we don't propagate the event.
            if (ev.id !== undefined) {
                return;
            }
            const action = actionStore.getActionById(ev.context);
            if (action) {
                listener(new ActionEvent(action, ev));
            }
        });
    }
    /**
     * Occurs when the user presses a action down.
     * @template T The type of settings associated with the action.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that, when disposed, removes the listener.
     */
    onKeyDown(listener) {
        return connection.disposableOn("keyDown", (ev) => {
            const action = actionStore.getActionById(ev.context);
            if (action?.isKey()) {
                listener(new ActionEvent(action, ev));
            }
        });
    }
    /**
     * Occurs when the user releases a pressed action.
     * @template T The type of settings associated with the action.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that, when disposed, removes the listener.
     */
    onKeyUp(listener) {
        return connection.disposableOn("keyUp", (ev) => {
            const action = actionStore.getActionById(ev.context);
            if (action?.isKey()) {
                listener(new ActionEvent(action, ev));
            }
        });
    }
    /**
     * Occurs when the user updates an action's title settings in the Stream Deck application. See also {@link Action.setTitle}.
     * @template T The type of settings associated with the action.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that, when disposed, removes the listener.
     */
    onTitleParametersDidChange(listener) {
        return connection.disposableOn("titleParametersDidChange", (ev) => {
            const action = actionStore.getActionById(ev.context);
            if (action) {
                listener(new ActionEvent(action, ev));
            }
        });
    }
    /**
     * Occurs when the user taps the touchscreen (Stream Deck +).
     * @template T The type of settings associated with the action.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that, when disposed, removes the listener.
     */
    onTouchTap(listener) {
        return connection.disposableOn("touchTap", (ev) => {
            const action = actionStore.getActionById(ev.context);
            if (action?.isDial()) {
                listener(new ActionEvent(action, ev));
            }
        });
    }
    /**
     * Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front
     * page". An action refers to _all_ types of actions, e.g. keys, dials,
     * @template T The type of settings associated with the action.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that, when disposed, removes the listener.
     */
    onWillAppear(listener) {
        return connection.disposableOn("willAppear", (ev) => {
            const action = actionStore.getActionById(ev.context);
            if (action) {
                listener(new ActionEvent(action, ev));
            }
        });
    }
    /**
     * Occurs when an action disappears from the Stream Deck due to the user navigating to another page, profile, folder, etc. An action refers to _all_ types of actions, e.g. keys,
     * dials, touchscreens, pedals, etc.
     * @template T The type of settings associated with the action.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that, when disposed, removes the listener.
     */
    onWillDisappear(listener) {
        return connection.disposableOn("willDisappear", (ev) => listener(new ActionEvent(new ActionContext(ev), ev)));
    }
    /**
     * Registers the action with the Stream Deck, routing all events associated with the {@link SingletonAction.manifestId} to the specified {@link action}.
     * @param action The action to register.
     * @example
     * ＠action({ UUID: "com.elgato.test.action" })
     * class MyCustomAction extends SingletonAction {
     *     export function onKeyDown(ev: KeyDownEvent) {
     *         // Do some awesome thing.
     *     }
     * }
     *
     * streamDeck.actions.registerAction(new MyCustomAction());
     */
    registerAction(action) {
        if (action.manifestId === undefined) {
            throw new Error("The action's manifestId cannot be undefined.");
        }
        if (manifest.value !== null && !manifest.value.Actions.some((a) => a.UUID === action.manifestId)) {
            throw new Error(`The action's manifestId was not found within the manifest: ${action.manifestId}`);
        }
        // Routes an event to the action, when the applicable listener is defined on the action.
        const { manifestId } = action;
        const route = (fn, listener) => {
            const boundedListener = listener?.bind(action);
            if (boundedListener === undefined) {
                return;
            }
            fn.bind(action)(async (ev) => {
                if (ev.action.manifestId == manifestId) {
                    await boundedListener(ev);
                }
            });
        };
        // Route each of the action events.
        route(this.onDialDown, action.onDialDown);
        route(this.onDialUp, action.onDialUp);
        route(this.onDialRotate, action.onDialRotate);
        route(ui.onSendToPlugin, action.onSendToPlugin);
        route(this.onDidReceiveResources, action.onDidReceiveResources);
        route(settings.onDidReceiveSettings, action.onDidReceiveSettings);
        route(this.onKeyDown, action.onKeyDown);
        route(this.onKeyUp, action.onKeyUp);
        route(ui.onDidAppear, action.onPropertyInspectorDidAppear);
        route(ui.onDidDisappear, action.onPropertyInspectorDidDisappear);
        route(this.onTitleParametersDidChange, action.onTitleParametersDidChange);
        route(this.onTouchTap, action.onTouchTap);
        route(this.onWillAppear, action.onWillAppear);
        route(this.onWillDisappear, action.onWillDisappear);
    }
}
/**
 * Service for interacting with Stream Deck actions.
 */
const actionService = new ActionService();

/**
 * Provides information about a device.
 */
class Device {
    /**
     * Private backing field for {@link Device.isConnected}.
     */
    #isConnected = false;
    /**
     * Private backing field for the device's information.
     */
    #info;
    /**
     * Unique identifier of the device.
     */
    id;
    /**
     * Initializes a new instance of the {@link Device} class.
     * @param id Device identifier.
     * @param info Information about the device.
     * @param isConnected Determines whether the device is connected.
     */
    constructor(id, info, isConnected) {
        this.id = id;
        this.#info = info;
        this.#isConnected = isConnected;
        // Set connected.
        connection.prependListener("deviceDidConnect", (ev) => {
            if (ev.device === this.id) {
                this.#info = ev.deviceInfo;
                this.#isConnected = true;
            }
        });
        // Track changes.
        connection.prependListener("deviceDidChange", (ev) => {
            if (ev.device === this.id) {
                this.#info = ev.deviceInfo;
            }
        });
        // Set disconnected.
        connection.prependListener("deviceDidDisconnect", (ev) => {
            if (ev.device === this.id) {
                this.#isConnected = false;
            }
        });
    }
    /**
     * Actions currently visible on the device.
     * @returns Collection of visible actions.
     */
    get actions() {
        return actionStore.filter((a) => a.device.id === this.id);
    }
    /**
     * Determines whether the device is currently connected.
     * @returns `true` when the device is connected; otherwise `false`.
     */
    get isConnected() {
        return this.#isConnected;
    }
    /**
     * Name of the device, as specified by the user in the Stream Deck application.
     * @returns Name of the device.
     */
    get name() {
        return this.#info.name;
    }
    /**
     * Number of action slots, excluding dials / touchscreens, available to the device.
     * @returns Size of the device.
     */
    get size() {
        return this.#info.size;
    }
    /**
     * Type of the device that was connected, e.g. Stream Deck +, Stream Deck Pedal, etc. See {@link DeviceType}.
     * @returns Type of the device.
     */
    get type() {
        return this.#info.type;
    }
}

/**
 * Provides functions, and information, for interacting with Stream Deck actions.
 */
class DeviceService extends ReadOnlyDeviceStore {
    /**
     * Initializes a new instance of the {@link DeviceService}.
     */
    constructor() {
        super();
        // Add the devices from registration parameters.
        connection.once("connected", (info) => {
            info.devices.forEach((dev) => deviceStore.set(new Device(dev.id, dev, false)));
        });
        // Add new devices that were connected.
        connection.on("deviceDidConnect", ({ device: id, deviceInfo }) => {
            if (!deviceStore.getDeviceById(id)) {
                deviceStore.set(new Device(id, deviceInfo, true));
            }
        });
        // Add new devices that were changed (Virtual Stream Deck event race).
        connection.on("deviceDidChange", ({ device: id, deviceInfo }) => {
            if (!deviceStore.getDeviceById(id)) {
                deviceStore.set(new Device(id, deviceInfo, false));
            }
        });
    }
    /**
     * Occurs when a Stream Deck device changed, for example its name or size.
     *
     * Available from Stream Deck 7.0.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that, when disposed, removes the listener.
     */
    onDeviceDidChange(listener) {
        requiresVersion(7.0, connection.version, "onDeviceDidChange");
        return connection.disposableOn("deviceDidChange", (ev) => listener(new DeviceEvent(ev, this.getDeviceById(ev.device))));
    }
    /**
     * Occurs when a Stream Deck device is connected. See also {@link DeviceService.onDeviceDidConnect}.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that, when disposed, removes the listener.
     */
    onDeviceDidConnect(listener) {
        return connection.disposableOn("deviceDidConnect", (ev) => listener(new DeviceEvent(ev, this.getDeviceById(ev.device))));
    }
    /**
     * Occurs when a Stream Deck device is disconnected. See also {@link DeviceService.onDeviceDidDisconnect}.
     * @param listener Function to be invoked when the event occurs.
     * @returns A disposable that, when disposed, removes the listener.
     */
    onDeviceDidDisconnect(listener) {
        return connection.disposableOn("deviceDidDisconnect", (ev) => listener(new DeviceEvent(ev, this.getDeviceById(ev.device))));
    }
}
/**
 * Provides functions, and information, for interacting with Stream Deck actions.
 */
const deviceService = new DeviceService();

/**
 * Loads a locale from the file system.
 * @param language Language to load.
 * @returns Contents of the locale.
 */
function fileSystemLocaleProvider(language) {
    const filePath = path.join(process.cwd(), `${language}.json`);
    if (!fs.existsSync(filePath)) {
        return null;
    }
    try {
        // Parse the translations from the file.
        const contents = fs.readFileSync(filePath, { flag: "r" })?.toString();
        return parseLocalizations(contents);
    }
    catch (err) {
        logger.error(`Failed to load translations from ${filePath}`, err);
        return null;
    }
}
/**
 * Parses the localizations from the specified contents, or throws a `TypeError` when unsuccessful.
 * @param contents Contents that represent the stringified JSON containing the localizations.
 * @returns The localizations; otherwise a `TypeError`.
 */
function parseLocalizations(contents) {
    const json = JSON.parse(contents);
    if (json !== undefined && json !== null && typeof json === "object" && "Localization" in json) {
        return json["Localization"];
    }
    throw new TypeError(`Translations must be a JSON object nested under a property named "Localization"`);
}

/**
 * Requests the Stream Deck switches the current profile of the specified {@link deviceId} to the {@link profile}; when no {@link profile} is provided the previously active profile
 * is activated.
 *
 * NB: Plugins may only switch to profiles distributed with the plugin, as defined within the manifest, and cannot access user-defined profiles.
 * @param deviceId Unique identifier of the device where the profile should be set.
 * @param profile Optional name of the profile to switch to; when `undefined` the previous profile will be activated. Name must be identical to the one provided in the manifest.
 * @param page Optional page to show when switching to the {@link profile}, indexed from 0. When `undefined`, the page that was previously visible (when switching away from the
 * profile) will be made visible.
 * @returns `Promise` resolved when the request to switch the `profile` has been sent to Stream Deck.
 */
function switchToProfile(deviceId, profile, page) {
    if (page !== undefined) {
        requiresVersion(6.5, connection.version, "Switching to a profile page");
    }
    return connection.send({
        event: "switchToProfile",
        context: connection.registrationParameters.pluginUUID,
        device: deviceId,
        payload: {
            page,
            profile,
        },
    });
}

var profiles = /*#__PURE__*/Object.freeze({
    __proto__: null,
    switchToProfile: switchToProfile
});

/**
 * Occurs when a monitored application is launched. Monitored applications can be defined in the manifest via the {@link Manifest.ApplicationsToMonitor} property.
 * See also {@link onApplicationDidTerminate}.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
function onApplicationDidLaunch(listener) {
    return connection.disposableOn("applicationDidLaunch", (ev) => listener(new ApplicationEvent(ev)));
}
/**
 * Occurs when a monitored application terminates. Monitored applications can be defined in the manifest via the {@link Manifest.ApplicationsToMonitor} property.
 * See also {@link onApplicationDidLaunch}.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
function onApplicationDidTerminate(listener) {
    return connection.disposableOn("applicationDidTerminate", (ev) => listener(new ApplicationEvent(ev)));
}
/**
 * Occurs when a deep-link message is routed to the plugin from Stream Deck. One-way deep-link messages can be sent to plugins from external applications using the URL format
 * `streamdeck://plugins/message/<PLUGIN_UUID>/{MESSAGE}`.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
function onDidReceiveDeepLink(listener) {
    requiresVersion(6.5, connection.version, "Receiving deep-link messages");
    return connection.disposableOn("didReceiveDeepLink", (ev) => listener(new DidReceiveDeepLinkEvent(ev)));
}
/**
 * Occurs when the computer wakes up.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
function onSystemDidWakeUp(listener) {
    return connection.disposableOn("systemDidWakeUp", (ev) => listener(new Event(ev)));
}
/**
 * Opens the specified `url` in the user's default browser.
 * @param url URL to open.
 * @returns `Promise` resolved when the request to open the `url` has been sent to Stream Deck.
 */
function openUrl(url) {
    return connection.send({
        event: "openUrl",
        payload: {
            url,
        },
    });
}
/**
 * Gets the secrets associated with the plugin.
 * @returns `Promise` resolved with the secrets associated with the plugin.
 */
function getSecrets() {
    requiresVersion(6.9, connection.version, "Secrets");
    requiresSDKVersion(3, "Secrets");
    return new Promise((resolve) => {
        connection.once("didReceiveSecrets", (ev) => resolve(ev.payload.secrets));
        connection.send({
            event: "getSecrets",
            context: connection.registrationParameters.pluginUUID,
        });
    });
}

var system = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getSecrets: getSecrets,
    onApplicationDidLaunch: onApplicationDidLaunch,
    onApplicationDidTerminate: onApplicationDidTerminate,
    onDidReceiveDeepLink: onDidReceiveDeepLink,
    onSystemDidWakeUp: onSystemDidWakeUp,
    openUrl: openUrl
});

/**
 * Defines a Stream Deck action associated with the plugin.
 * @param definition The definition of the action, e.g. it's identifier, name, etc.
 * @returns The definition decorator.
 */
function action(definition) {
    const manifestId = definition.UUID;
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unused-vars
    return function (target, context) {
        return class extends target {
            /**
             * The universally-unique value that identifies the action within the manifest.
             */
            manifestId = manifestId;
        };
    };
}

/**
 * Provides the main bridge between the plugin and the Stream Deck allowing the plugin to send requests and receive events, e.g. when the user presses an action.
 * @template T The type of settings associated with the action.
 */
class SingletonAction {
    /**
     * The universally-unique value that identifies the action within the manifest.
     */
    manifestId;
    /**
     * Gets the visible actions with the `manifestId` that match this instance's.
     * @returns The visible actions.
     */
    get actions() {
        return actionStore.filter((a) => a.manifestId === this.manifestId);
    }
}

let i18n;
const streamDeck = {
    /**
     * Namespace for event listeners and functionality relating to Stream Deck actions.
     * @returns Actions namespace.
     */
    get actions() {
        return actionService;
    },
    /**
     * Namespace for interacting with Stream Deck devices.
     * @returns Devices namespace.
     */
    get devices() {
        return deviceService;
    },
    /**
     * Internalization provider, responsible for managing localizations and translating resources.
     * @returns Internalization provider.
     */
    get i18n() {
        return (i18n ??= new I18nProvider(this.info.application.language, fileSystemLocaleProvider));
    },
    /**
     * Registration and application information provided by Stream Deck during initialization.
     * @returns Registration information.
     */
    get info() {
        return connection.registrationParameters.info;
    },
    /**
     * Logger responsible for capturing log messages.
     * @returns The logger.
     */
    get logger() {
        return logger;
    },
    /**
     * Namespace for Stream Deck profiles.
     * @returns Profiles namespace.
     */
    get profiles() {
        return profiles;
    },
    /**
     * Namespace for persisting settings within Stream Deck.
     * @returns Settings namespace.
     */
    get settings() {
        return settings;
    },
    /**
     * Namespace for interacting with, and receiving events from, the system the plugin is running on.
     * @returns System namespace.
     */
    get system() {
        return system;
    },
    /**
     * Namespace for interacting with UI (property inspector) associated with the plugin.
     * @returns UI namespace.
     */
    get ui() {
        return ui;
    },
    /**
     * Connects the plugin to the Stream Deck.
     * @returns A promise resolved when a connection has been established.
     */
    connect() {
        return connection.connect();
    },
};

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
}
function __runInitializers(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
}
typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var omggif = {};

var hasRequiredOmggif;

function requireOmggif () {
	if (hasRequiredOmggif) return omggif;
	hasRequiredOmggif = 1;

	function GifWriter(buf, width, height, gopts) {
	  var p = 0;

	  var gopts = gopts === undefined ? { } : gopts;
	  var loop_count = gopts.loop === undefined ? null : gopts.loop;
	  var global_palette = gopts.palette === undefined ? null : gopts.palette;

	  if (width <= 0 || height <= 0 || width > 65535 || height > 65535)
	    throw new Error("Width/Height invalid.");

	  function check_palette_and_num_colors(palette) {
	    var num_colors = palette.length;
	    if (num_colors < 2 || num_colors > 256 ||  num_colors & (num_colors-1)) {
	      throw new Error(
	          "Invalid code/color length, must be power of 2 and 2 .. 256.");
	    }
	    return num_colors;
	  }

	  // - Header.
	  buf[p++] = 0x47; buf[p++] = 0x49; buf[p++] = 0x46;  // GIF
	  buf[p++] = 0x38; buf[p++] = 0x39; buf[p++] = 0x61;  // 89a

	  // Handling of Global Color Table (palette) and background index.
	  var gp_num_colors_pow2 = 0;
	  var background = 0;
	  if (global_palette !== null) {
	    var gp_num_colors = check_palette_and_num_colors(global_palette);
	    while (gp_num_colors >>= 1) ++gp_num_colors_pow2;
	    gp_num_colors = 1 << gp_num_colors_pow2;
	    --gp_num_colors_pow2;
	    if (gopts.background !== undefined) {
	      background = gopts.background;
	      if (background >= gp_num_colors)
	        throw new Error("Background index out of range.");
	      // The GIF spec states that a background index of 0 should be ignored, so
	      // this is probably a mistake and you really want to set it to another
	      // slot in the palette.  But actually in the end most browsers, etc end
	      // up ignoring this almost completely (including for dispose background).
	      if (background === 0)
	        throw new Error("Background index explicitly passed as 0.");
	    }
	  }

	  // - Logical Screen Descriptor.
	  // NOTE(deanm): w/h apparently ignored by implementations, but set anyway.
	  buf[p++] = width & 0xff; buf[p++] = width >> 8 & 0xff;
	  buf[p++] = height & 0xff; buf[p++] = height >> 8 & 0xff;
	  // NOTE: Indicates 0-bpp original color resolution (unused?).
	  buf[p++] = (global_palette !== null ? 0x80 : 0) |  // Global Color Table Flag.
	             gp_num_colors_pow2;  // NOTE: No sort flag (unused?).
	  buf[p++] = background;  // Background Color Index.
	  buf[p++] = 0;  // Pixel aspect ratio (unused?).

	  // - Global Color Table
	  if (global_palette !== null) {
	    for (var i = 0, il = global_palette.length; i < il; ++i) {
	      var rgb = global_palette[i];
	      buf[p++] = rgb >> 16 & 0xff;
	      buf[p++] = rgb >> 8 & 0xff;
	      buf[p++] = rgb & 0xff;
	    }
	  }

	  if (loop_count !== null) {  // Netscape block for looping.
	    if (loop_count < 0 || loop_count > 65535)
	      throw new Error("Loop count invalid.")
	    // Extension code, label, and length.
	    buf[p++] = 0x21; buf[p++] = 0xff; buf[p++] = 0x0b;
	    // NETSCAPE2.0
	    buf[p++] = 0x4e; buf[p++] = 0x45; buf[p++] = 0x54; buf[p++] = 0x53;
	    buf[p++] = 0x43; buf[p++] = 0x41; buf[p++] = 0x50; buf[p++] = 0x45;
	    buf[p++] = 0x32; buf[p++] = 0x2e; buf[p++] = 0x30;
	    // Sub-block
	    buf[p++] = 0x03; buf[p++] = 0x01;
	    buf[p++] = loop_count & 0xff; buf[p++] = loop_count >> 8 & 0xff;
	    buf[p++] = 0x00;  // Terminator.
	  }


	  var ended = false;

	  this.addFrame = function(x, y, w, h, indexed_pixels, opts) {
	    if (ended === true) { --p; ended = false; }  // Un-end.

	    opts = opts === undefined ? { } : opts;

	    // TODO(deanm): Bounds check x, y.  Do they need to be within the virtual
	    // canvas width/height, I imagine?
	    if (x < 0 || y < 0 || x > 65535 || y > 65535)
	      throw new Error("x/y invalid.")

	    if (w <= 0 || h <= 0 || w > 65535 || h > 65535)
	      throw new Error("Width/Height invalid.")

	    if (indexed_pixels.length < w * h)
	      throw new Error("Not enough pixels for the frame size.");

	    var using_local_palette = true;
	    var palette = opts.palette;
	    if (palette === undefined || palette === null) {
	      using_local_palette = false;
	      palette = global_palette;
	    }

	    if (palette === undefined || palette === null)
	      throw new Error("Must supply either a local or global palette.");

	    var num_colors = check_palette_and_num_colors(palette);

	    // Compute the min_code_size (power of 2), destroying num_colors.
	    var min_code_size = 0;
	    while (num_colors >>= 1) ++min_code_size;
	    num_colors = 1 << min_code_size;  // Now we can easily get it back.

	    var delay = opts.delay === undefined ? 0 : opts.delay;

	    // From the spec:
	    //     0 -   No disposal specified. The decoder is
	    //           not required to take any action.
	    //     1 -   Do not dispose. The graphic is to be left
	    //           in place.
	    //     2 -   Restore to background color. The area used by the
	    //           graphic must be restored to the background color.
	    //     3 -   Restore to previous. The decoder is required to
	    //           restore the area overwritten by the graphic with
	    //           what was there prior to rendering the graphic.
	    //  4-7 -    To be defined.
	    // NOTE(deanm): Dispose background doesn't really work, apparently most
	    // browsers ignore the background palette index and clear to transparency.
	    var disposal = opts.disposal === undefined ? 0 : opts.disposal;
	    if (disposal < 0 || disposal > 3)  // 4-7 is reserved.
	      throw new Error("Disposal out of range.");

	    var use_transparency = false;
	    var transparent_index = 0;
	    if (opts.transparent !== undefined && opts.transparent !== null) {
	      use_transparency = true;
	      transparent_index = opts.transparent;
	      if (transparent_index < 0 || transparent_index >= num_colors)
	        throw new Error("Transparent color index.");
	    }

	    if (disposal !== 0 || use_transparency || delay !== 0) {
	      // - Graphics Control Extension
	      buf[p++] = 0x21; buf[p++] = 0xf9;  // Extension / Label.
	      buf[p++] = 4;  // Byte size.

	      buf[p++] = disposal << 2 | (use_transparency === true ? 1 : 0);
	      buf[p++] = delay & 0xff; buf[p++] = delay >> 8 & 0xff;
	      buf[p++] = transparent_index;  // Transparent color index.
	      buf[p++] = 0;  // Block Terminator.
	    }

	    // - Image Descriptor
	    buf[p++] = 0x2c;  // Image Seperator.
	    buf[p++] = x & 0xff; buf[p++] = x >> 8 & 0xff;  // Left.
	    buf[p++] = y & 0xff; buf[p++] = y >> 8 & 0xff;  // Top.
	    buf[p++] = w & 0xff; buf[p++] = w >> 8 & 0xff;
	    buf[p++] = h & 0xff; buf[p++] = h >> 8 & 0xff;
	    // NOTE: No sort flag (unused?).
	    // TODO(deanm): Support interlace.
	    buf[p++] = using_local_palette === true ? (0x80 | (min_code_size-1)) : 0;

	    // - Local Color Table
	    if (using_local_palette === true) {
	      for (var i = 0, il = palette.length; i < il; ++i) {
	        var rgb = palette[i];
	        buf[p++] = rgb >> 16 & 0xff;
	        buf[p++] = rgb >> 8 & 0xff;
	        buf[p++] = rgb & 0xff;
	      }
	    }

	    p = GifWriterOutputLZWCodeStream(
	            buf, p, min_code_size < 2 ? 2 : min_code_size, indexed_pixels);

	    return p;
	  };

	  this.end = function() {
	    if (ended === false) {
	      buf[p++] = 0x3b;  // Trailer.
	      ended = true;
	    }
	    return p;
	  };

	  this.getOutputBuffer = function() { return buf; };
	  this.setOutputBuffer = function(v) { buf = v; };
	  this.getOutputBufferPosition = function() { return p; };
	  this.setOutputBufferPosition = function(v) { p = v; };
	}

	// Main compression routine, palette indexes -> LZW code stream.
	// |index_stream| must have at least one entry.
	function GifWriterOutputLZWCodeStream(buf, p, min_code_size, index_stream) {
	  buf[p++] = min_code_size;
	  var cur_subblock = p++;  // Pointing at the length field.

	  var clear_code = 1 << min_code_size;
	  var code_mask = clear_code - 1;
	  var eoi_code = clear_code + 1;
	  var next_code = eoi_code + 1;

	  var cur_code_size = min_code_size + 1;  // Number of bits per code.
	  var cur_shift = 0;
	  // We have at most 12-bit codes, so we should have to hold a max of 19
	  // bits here (and then we would write out).
	  var cur = 0;

	  function emit_bytes_to_buffer(bit_block_size) {
	    while (cur_shift >= bit_block_size) {
	      buf[p++] = cur & 0xff;
	      cur >>= 8; cur_shift -= 8;
	      if (p === cur_subblock + 256) {  // Finished a subblock.
	        buf[cur_subblock] = 255;
	        cur_subblock = p++;
	      }
	    }
	  }

	  function emit_code(c) {
	    cur |= c << cur_shift;
	    cur_shift += cur_code_size;
	    emit_bytes_to_buffer(8);
	  }

	  // I am not an expert on the topic, and I don't want to write a thesis.
	  // However, it is good to outline here the basic algorithm and the few data
	  // structures and optimizations here that make this implementation fast.
	  // The basic idea behind LZW is to build a table of previously seen runs
	  // addressed by a short id (herein called output code).  All data is
	  // referenced by a code, which represents one or more values from the
	  // original input stream.  All input bytes can be referenced as the same
	  // value as an output code.  So if you didn't want any compression, you
	  // could more or less just output the original bytes as codes (there are
	  // some details to this, but it is the idea).  In order to achieve
	  // compression, values greater then the input range (codes can be up to
	  // 12-bit while input only 8-bit) represent a sequence of previously seen
	  // inputs.  The decompressor is able to build the same mapping while
	  // decoding, so there is always a shared common knowledge between the
	  // encoding and decoder, which is also important for "timing" aspects like
	  // how to handle variable bit width code encoding.
	  //
	  // One obvious but very important consequence of the table system is there
	  // is always a unique id (at most 12-bits) to map the runs.  'A' might be
	  // 4, then 'AA' might be 10, 'AAA' 11, 'AAAA' 12, etc.  This relationship
	  // can be used for an effecient lookup strategy for the code mapping.  We
	  // need to know if a run has been seen before, and be able to map that run
	  // to the output code.  Since we start with known unique ids (input bytes),
	  // and then from those build more unique ids (table entries), we can
	  // continue this chain (almost like a linked list) to always have small
	  // integer values that represent the current byte chains in the encoder.
	  // This means instead of tracking the input bytes (AAAABCD) to know our
	  // current state, we can track the table entry for AAAABC (it is guaranteed
	  // to exist by the nature of the algorithm) and the next character D.
	  // Therefor the tuple of (table_entry, byte) is guaranteed to also be
	  // unique.  This allows us to create a simple lookup key for mapping input
	  // sequences to codes (table indices) without having to store or search
	  // any of the code sequences.  So if 'AAAA' has a table entry of 12, the
	  // tuple of ('AAAA', K) for any input byte K will be unique, and can be our
	  // key.  This leads to a integer value at most 20-bits, which can always
	  // fit in an SMI value and be used as a fast sparse array / object key.

	  // Output code for the current contents of the index buffer.
	  var ib_code = index_stream[0] & code_mask;  // Load first input index.
	  var code_table = { };  // Key'd on our 20-bit "tuple".

	  emit_code(clear_code);  // Spec says first code should be a clear code.

	  // First index already loaded, process the rest of the stream.
	  for (var i = 1, il = index_stream.length; i < il; ++i) {
	    var k = index_stream[i] & code_mask;
	    var cur_key = ib_code << 8 | k;  // (prev, k) unique tuple.
	    var cur_code = code_table[cur_key];  // buffer + k.

	    // Check if we have to create a new code table entry.
	    if (cur_code === undefined) {  // We don't have buffer + k.
	      // Emit index buffer (without k).
	      // This is an inline version of emit_code, because this is the core
	      // writing routine of the compressor (and V8 cannot inline emit_code
	      // because it is a closure here in a different context).  Additionally
	      // we can call emit_byte_to_buffer less often, because we can have
	      // 30-bits (from our 31-bit signed SMI), and we know our codes will only
	      // be 12-bits, so can safely have 18-bits there without overflow.
	      // emit_code(ib_code);
	      cur |= ib_code << cur_shift;
	      cur_shift += cur_code_size;
	      while (cur_shift >= 8) {
	        buf[p++] = cur & 0xff;
	        cur >>= 8; cur_shift -= 8;
	        if (p === cur_subblock + 256) {  // Finished a subblock.
	          buf[cur_subblock] = 255;
	          cur_subblock = p++;
	        }
	      }

	      if (next_code === 4096) {  // Table full, need a clear.
	        emit_code(clear_code);
	        next_code = eoi_code + 1;
	        cur_code_size = min_code_size + 1;
	        code_table = { };
	      } else {  // Table not full, insert a new entry.
	        // Increase our variable bit code sizes if necessary.  This is a bit
	        // tricky as it is based on "timing" between the encoding and
	        // decoder.  From the encoders perspective this should happen after
	        // we've already emitted the index buffer and are about to create the
	        // first table entry that would overflow our current code bit size.
	        if (next_code >= (1 << cur_code_size)) ++cur_code_size;
	        code_table[cur_key] = next_code++;  // Insert into code table.
	      }

	      ib_code = k;  // Index buffer to single input k.
	    } else {
	      ib_code = cur_code;  // Index buffer to sequence in code table.
	    }
	  }

	  emit_code(ib_code);  // There will still be something in the index buffer.
	  emit_code(eoi_code);  // End Of Information.

	  // Flush / finalize the sub-blocks stream to the buffer.
	  emit_bytes_to_buffer(1);

	  // Finish the sub-blocks, writing out any unfinished lengths and
	  // terminating with a sub-block of length 0.  If we have already started
	  // but not yet used a sub-block it can just become the terminator.
	  if (cur_subblock + 1 === p) {  // Started but unused.
	    buf[cur_subblock] = 0;
	  } else {  // Started and used, write length and additional terminator block.
	    buf[cur_subblock] = p - cur_subblock - 1;
	    buf[p++] = 0;
	  }
	  return p;
	}

	function GifReader(buf) {
	  var p = 0;

	  // - Header (GIF87a or GIF89a).
	  if (buf[p++] !== 0x47 ||            buf[p++] !== 0x49 || buf[p++] !== 0x46 ||
	      buf[p++] !== 0x38 || (buf[p++]+1 & 0xfd) !== 0x38 || buf[p++] !== 0x61) {
	    throw new Error("Invalid GIF 87a/89a header.");
	  }

	  // - Logical Screen Descriptor.
	  var width = buf[p++] | buf[p++] << 8;
	  var height = buf[p++] | buf[p++] << 8;
	  var pf0 = buf[p++];  // <Packed Fields>.
	  var global_palette_flag = pf0 >> 7;
	  var num_global_colors_pow2 = pf0 & 0x7;
	  var num_global_colors = 1 << (num_global_colors_pow2 + 1);
	  buf[p++];
	  buf[p++];  // Pixel aspect ratio (unused?).

	  var global_palette_offset = null;
	  var global_palette_size   = null;

	  if (global_palette_flag) {
	    global_palette_offset = p;
	    global_palette_size = num_global_colors;
	    p += num_global_colors * 3;  // Seek past palette.
	  }

	  var no_eof = true;

	  var frames = [ ];

	  var delay = 0;
	  var transparent_index = null;
	  var disposal = 0;  // 0 - No disposal specified.
	  var loop_count = null;

	  this.width = width;
	  this.height = height;

	  while (no_eof && p < buf.length) {
	    switch (buf[p++]) {
	      case 0x21:  // Graphics Control Extension Block
	        switch (buf[p++]) {
	          case 0xff:  // Application specific block
	            // Try if it's a Netscape block (with animation loop counter).
	            if (buf[p   ] !== 0x0b ||  // 21 FF already read, check block size.
	                // NETSCAPE2.0
	                buf[p+1 ] == 0x4e && buf[p+2 ] == 0x45 && buf[p+3 ] == 0x54 &&
	                buf[p+4 ] == 0x53 && buf[p+5 ] == 0x43 && buf[p+6 ] == 0x41 &&
	                buf[p+7 ] == 0x50 && buf[p+8 ] == 0x45 && buf[p+9 ] == 0x32 &&
	                buf[p+10] == 0x2e && buf[p+11] == 0x30 &&
	                // Sub-block
	                buf[p+12] == 0x03 && buf[p+13] == 0x01 && buf[p+16] == 0) {
	              p += 14;
	              loop_count = buf[p++] | buf[p++] << 8;
	              p++;  // Skip terminator.
	            } else {  // We don't know what it is, just try to get past it.
	              p += 12;
	              while (true) {  // Seek through subblocks.
	                var block_size = buf[p++];
	                // Bad block size (ex: undefined from an out of bounds read).
	                if (!(block_size >= 0)) throw Error("Invalid block size");
	                if (block_size === 0) break;  // 0 size is terminator
	                p += block_size;
	              }
	            }
	            break;

	          case 0xf9:  // Graphics Control Extension
	            if (buf[p++] !== 0x4 || buf[p+4] !== 0)
	              throw new Error("Invalid graphics extension block.");
	            var pf1 = buf[p++];
	            delay = buf[p++] | buf[p++] << 8;
	            transparent_index = buf[p++];
	            if ((pf1 & 1) === 0) transparent_index = null;
	            disposal = pf1 >> 2 & 0x7;
	            p++;  // Skip terminator.
	            break;

	          case 0xfe:  // Comment Extension.
	            while (true) {  // Seek through subblocks.
	              var block_size = buf[p++];
	              // Bad block size (ex: undefined from an out of bounds read).
	              if (!(block_size >= 0)) throw Error("Invalid block size");
	              if (block_size === 0) break;  // 0 size is terminator
	              // console.log(buf.slice(p, p+block_size).toString('ascii'));
	              p += block_size;
	            }
	            break;

	          default:
	            throw new Error(
	                "Unknown graphic control label: 0x" + buf[p-1].toString(16));
	        }
	        break;

	      case 0x2c:  // Image Descriptor.
	        var x = buf[p++] | buf[p++] << 8;
	        var y = buf[p++] | buf[p++] << 8;
	        var w = buf[p++] | buf[p++] << 8;
	        var h = buf[p++] | buf[p++] << 8;
	        var pf2 = buf[p++];
	        var local_palette_flag = pf2 >> 7;
	        var interlace_flag = pf2 >> 6 & 1;
	        var num_local_colors_pow2 = pf2 & 0x7;
	        var num_local_colors = 1 << (num_local_colors_pow2 + 1);
	        var palette_offset = global_palette_offset;
	        var palette_size = global_palette_size;
	        var has_local_palette = false;
	        if (local_palette_flag) {
	          var has_local_palette = true;
	          palette_offset = p;  // Override with local palette.
	          palette_size = num_local_colors;
	          p += num_local_colors * 3;  // Seek past palette.
	        }

	        var data_offset = p;

	        p++;  // codesize
	        while (true) {
	          var block_size = buf[p++];
	          // Bad block size (ex: undefined from an out of bounds read).
	          if (!(block_size >= 0)) throw Error("Invalid block size");
	          if (block_size === 0) break;  // 0 size is terminator
	          p += block_size;
	        }

	        frames.push({x: x, y: y, width: w, height: h,
	                     has_local_palette: has_local_palette,
	                     palette_offset: palette_offset,
	                     palette_size: palette_size,
	                     data_offset: data_offset,
	                     data_length: p - data_offset,
	                     transparent_index: transparent_index,
	                     interlaced: !!interlace_flag,
	                     delay: delay,
	                     disposal: disposal});
	        break;

	      case 0x3b:  // Trailer Marker (end of file).
	        no_eof = false;
	        break;

	      default:
	        throw new Error("Unknown gif block: 0x" + buf[p-1].toString(16));
	    }
	  }

	  this.numFrames = function() {
	    return frames.length;
	  };

	  this.loopCount = function() {
	    return loop_count;
	  };

	  this.frameInfo = function(frame_num) {
	    if (frame_num < 0 || frame_num >= frames.length)
	      throw new Error("Frame index out of range.");
	    return frames[frame_num];
	  };

	  this.decodeAndBlitFrameBGRA = function(frame_num, pixels) {
	    var frame = this.frameInfo(frame_num);
	    var num_pixels = frame.width * frame.height;
	    var index_stream = new Uint8Array(num_pixels);  // At most 8-bit indices.
	    GifReaderLZWOutputIndexStream(
	        buf, frame.data_offset, index_stream, num_pixels);
	    var palette_offset = frame.palette_offset;

	    // NOTE(deanm): It seems to be much faster to compare index to 256 than
	    // to === null.  Not sure why, but CompareStub_EQ_STRICT shows up high in
	    // the profile, not sure if it's related to using a Uint8Array.
	    var trans = frame.transparent_index;
	    if (trans === null) trans = 256;

	    // We are possibly just blitting to a portion of the entire frame.
	    // That is a subrect within the framerect, so the additional pixels
	    // must be skipped over after we finished a scanline.
	    var framewidth  = frame.width;
	    var framestride = width - framewidth;
	    var xleft       = framewidth;  // Number of subrect pixels left in scanline.

	    // Output indicies of the top left and bottom right corners of the subrect.
	    var opbeg = ((frame.y * width) + frame.x) * 4;
	    var opend = ((frame.y + frame.height) * width + frame.x) * 4;
	    var op    = opbeg;

	    var scanstride = framestride * 4;

	    // Use scanstride to skip past the rows when interlacing.  This is skipping
	    // 7 rows for the first two passes, then 3 then 1.
	    if (frame.interlaced === true) {
	      scanstride += width * 4 * 7;  // Pass 1.
	    }

	    var interlaceskip = 8;  // Tracking the row interval in the current pass.

	    for (var i = 0, il = index_stream.length; i < il; ++i) {
	      var index = index_stream[i];

	      if (xleft === 0) {  // Beginning of new scan line
	        op += scanstride;
	        xleft = framewidth;
	        if (op >= opend) { // Catch the wrap to switch passes when interlacing.
	          scanstride = framestride * 4 + width * 4 * (interlaceskip-1);
	          // interlaceskip / 2 * 4 is interlaceskip << 1.
	          op = opbeg + (framewidth + framestride) * (interlaceskip << 1);
	          interlaceskip >>= 1;
	        }
	      }

	      if (index === trans) {
	        op += 4;
	      } else {
	        var r = buf[palette_offset + index * 3];
	        var g = buf[palette_offset + index * 3 + 1];
	        var b = buf[palette_offset + index * 3 + 2];
	        pixels[op++] = b;
	        pixels[op++] = g;
	        pixels[op++] = r;
	        pixels[op++] = 255;
	      }
	      --xleft;
	    }
	  };

	  // I will go to copy and paste hell one day...
	  this.decodeAndBlitFrameRGBA = function(frame_num, pixels) {
	    var frame = this.frameInfo(frame_num);
	    var num_pixels = frame.width * frame.height;
	    var index_stream = new Uint8Array(num_pixels);  // At most 8-bit indices.
	    GifReaderLZWOutputIndexStream(
	        buf, frame.data_offset, index_stream, num_pixels);
	    var palette_offset = frame.palette_offset;

	    // NOTE(deanm): It seems to be much faster to compare index to 256 than
	    // to === null.  Not sure why, but CompareStub_EQ_STRICT shows up high in
	    // the profile, not sure if it's related to using a Uint8Array.
	    var trans = frame.transparent_index;
	    if (trans === null) trans = 256;

	    // We are possibly just blitting to a portion of the entire frame.
	    // That is a subrect within the framerect, so the additional pixels
	    // must be skipped over after we finished a scanline.
	    var framewidth  = frame.width;
	    var framestride = width - framewidth;
	    var xleft       = framewidth;  // Number of subrect pixels left in scanline.

	    // Output indicies of the top left and bottom right corners of the subrect.
	    var opbeg = ((frame.y * width) + frame.x) * 4;
	    var opend = ((frame.y + frame.height) * width + frame.x) * 4;
	    var op    = opbeg;

	    var scanstride = framestride * 4;

	    // Use scanstride to skip past the rows when interlacing.  This is skipping
	    // 7 rows for the first two passes, then 3 then 1.
	    if (frame.interlaced === true) {
	      scanstride += width * 4 * 7;  // Pass 1.
	    }

	    var interlaceskip = 8;  // Tracking the row interval in the current pass.

	    for (var i = 0, il = index_stream.length; i < il; ++i) {
	      var index = index_stream[i];

	      if (xleft === 0) {  // Beginning of new scan line
	        op += scanstride;
	        xleft = framewidth;
	        if (op >= opend) { // Catch the wrap to switch passes when interlacing.
	          scanstride = framestride * 4 + width * 4 * (interlaceskip-1);
	          // interlaceskip / 2 * 4 is interlaceskip << 1.
	          op = opbeg + (framewidth + framestride) * (interlaceskip << 1);
	          interlaceskip >>= 1;
	        }
	      }

	      if (index === trans) {
	        op += 4;
	      } else {
	        var r = buf[palette_offset + index * 3];
	        var g = buf[palette_offset + index * 3 + 1];
	        var b = buf[palette_offset + index * 3 + 2];
	        pixels[op++] = r;
	        pixels[op++] = g;
	        pixels[op++] = b;
	        pixels[op++] = 255;
	      }
	      --xleft;
	    }
	  };
	}

	function GifReaderLZWOutputIndexStream(code_stream, p, output, output_length) {
	  var min_code_size = code_stream[p++];

	  var clear_code = 1 << min_code_size;
	  var eoi_code = clear_code + 1;
	  var next_code = eoi_code + 1;

	  var cur_code_size = min_code_size + 1;  // Number of bits per code.
	  // NOTE: This shares the same name as the encoder, but has a different
	  // meaning here.  Here this masks each code coming from the code stream.
	  var code_mask = (1 << cur_code_size) - 1;
	  var cur_shift = 0;
	  var cur = 0;

	  var op = 0;  // Output pointer.

	  var subblock_size = code_stream[p++];

	  // TODO(deanm): Would using a TypedArray be any faster?  At least it would
	  // solve the fast mode / backing store uncertainty.
	  // var code_table = Array(4096);
	  var code_table = new Int32Array(4096);  // Can be signed, we only use 20 bits.

	  var prev_code = null;  // Track code-1.

	  while (true) {
	    // Read up to two bytes, making sure we always 12-bits for max sized code.
	    while (cur_shift < 16) {
	      if (subblock_size === 0) break;  // No more data to be read.

	      cur |= code_stream[p++] << cur_shift;
	      cur_shift += 8;

	      if (subblock_size === 1) {  // Never let it get to 0 to hold logic above.
	        subblock_size = code_stream[p++];  // Next subblock.
	      } else {
	        --subblock_size;
	      }
	    }

	    // TODO(deanm): We should never really get here, we should have received
	    // and EOI.
	    if (cur_shift < cur_code_size)
	      break;

	    var code = cur & code_mask;
	    cur >>= cur_code_size;
	    cur_shift -= cur_code_size;

	    // TODO(deanm): Maybe should check that the first code was a clear code,
	    // at least this is what you're supposed to do.  But actually our encoder
	    // now doesn't emit a clear code first anyway.
	    if (code === clear_code) {
	      // We don't actually have to clear the table.  This could be a good idea
	      // for greater error checking, but we don't really do any anyway.  We
	      // will just track it with next_code and overwrite old entries.

	      next_code = eoi_code + 1;
	      cur_code_size = min_code_size + 1;
	      code_mask = (1 << cur_code_size) - 1;

	      // Don't update prev_code ?
	      prev_code = null;
	      continue;
	    } else if (code === eoi_code) {
	      break;
	    }

	    // We have a similar situation as the decoder, where we want to store
	    // variable length entries (code table entries), but we want to do in a
	    // faster manner than an array of arrays.  The code below stores sort of a
	    // linked list within the code table, and then "chases" through it to
	    // construct the dictionary entries.  When a new entry is created, just the
	    // last byte is stored, and the rest (prefix) of the entry is only
	    // referenced by its table entry.  Then the code chases through the
	    // prefixes until it reaches a single byte code.  We have to chase twice,
	    // first to compute the length, and then to actually copy the data to the
	    // output (backwards, since we know the length).  The alternative would be
	    // storing something in an intermediate stack, but that doesn't make any
	    // more sense.  I implemented an approach where it also stored the length
	    // in the code table, although it's a bit tricky because you run out of
	    // bits (12 + 12 + 8), but I didn't measure much improvements (the table
	    // entries are generally not the long).  Even when I created benchmarks for
	    // very long table entries the complexity did not seem worth it.
	    // The code table stores the prefix entry in 12 bits and then the suffix
	    // byte in 8 bits, so each entry is 20 bits.

	    var chase_code = code < next_code ? code : prev_code;

	    // Chase what we will output, either {CODE} or {CODE-1}.
	    var chase_length = 0;
	    var chase = chase_code;
	    while (chase > clear_code) {
	      chase = code_table[chase] >> 8;
	      ++chase_length;
	    }

	    var k = chase;

	    var op_end = op + chase_length + (chase_code !== code ? 1 : 0);
	    if (op_end > output_length) {
	      console.log("Warning, gif stream longer than expected.");
	      return;
	    }

	    // Already have the first byte from the chase, might as well write it fast.
	    output[op++] = k;

	    op += chase_length;
	    var b = op;  // Track pointer, writing backwards.

	    if (chase_code !== code)  // The case of emitting {CODE-1} + k.
	      output[op++] = k;

	    chase = chase_code;
	    while (chase_length--) {
	      chase = code_table[chase];
	      output[--b] = chase & 0xff;  // Write backwards.
	      chase >>= 8;  // Pull down to the prefix code.
	    }

	    if (prev_code !== null && next_code < 4096) {
	      code_table[next_code++] = prev_code << 8 | k;
	      // TODO(deanm): Figure out this clearing vs code growth logic better.  I
	      // have an feeling that it should just happen somewhere else, for now it
	      // is awkward between when we grow past the max and then hit a clear code.
	      // For now just check if we hit the max 12-bits (then a clear code should
	      // follow, also of course encoded in 12-bits).
	      if (next_code >= code_mask+1 && cur_code_size < 12) {
	        ++cur_code_size;
	        code_mask = code_mask << 1 | 1;
	      }
	    }

	    prev_code = code;
	  }

	  if (op !== output_length) {
	    console.log("Warning, gif stream shorter than expected.");
	  }

	  return output;
	}

	// CommonJS.
	try { omggif.GifWriter = GifWriter; omggif.GifReader = GifReader; } catch(e) {}
	return omggif;
}

var omggifExports = requireOmggif();

var png = {};

var parserAsync = {exports: {}};

var chunkstream = {exports: {}};

var hasRequiredChunkstream;

function requireChunkstream () {
	if (hasRequiredChunkstream) return chunkstream.exports;
	hasRequiredChunkstream = 1;

	let util = require$$0$3;
	let Stream = require$$1;

	let ChunkStream = (chunkstream.exports = function () {
	  Stream.call(this);

	  this._buffers = [];
	  this._buffered = 0;

	  this._reads = [];
	  this._paused = false;

	  this._encoding = "utf8";
	  this.writable = true;
	});
	util.inherits(ChunkStream, Stream);

	ChunkStream.prototype.read = function (length, callback) {
	  this._reads.push({
	    length: Math.abs(length), // if length < 0 then at most this length
	    allowLess: length < 0,
	    func: callback,
	  });

	  process.nextTick(
	    function () {
	      this._process();

	      // its paused and there is not enought data then ask for more
	      if (this._paused && this._reads && this._reads.length > 0) {
	        this._paused = false;

	        this.emit("drain");
	      }
	    }.bind(this)
	  );
	};

	ChunkStream.prototype.write = function (data, encoding) {
	  if (!this.writable) {
	    this.emit("error", new Error("Stream not writable"));
	    return false;
	  }

	  let dataBuffer;
	  if (Buffer.isBuffer(data)) {
	    dataBuffer = data;
	  } else {
	    dataBuffer = Buffer.from(data, encoding || this._encoding);
	  }

	  this._buffers.push(dataBuffer);
	  this._buffered += dataBuffer.length;

	  this._process();

	  // ok if there are no more read requests
	  if (this._reads && this._reads.length === 0) {
	    this._paused = true;
	  }

	  return this.writable && !this._paused;
	};

	ChunkStream.prototype.end = function (data, encoding) {
	  if (data) {
	    this.write(data, encoding);
	  }

	  this.writable = false;

	  // already destroyed
	  if (!this._buffers) {
	    return;
	  }

	  // enqueue or handle end
	  if (this._buffers.length === 0) {
	    this._end();
	  } else {
	    this._buffers.push(null);
	    this._process();
	  }
	};

	ChunkStream.prototype.destroySoon = ChunkStream.prototype.end;

	ChunkStream.prototype._end = function () {
	  if (this._reads.length > 0) {
	    this.emit("error", new Error("Unexpected end of input"));
	  }

	  this.destroy();
	};

	ChunkStream.prototype.destroy = function () {
	  if (!this._buffers) {
	    return;
	  }

	  this.writable = false;
	  this._reads = null;
	  this._buffers = null;

	  this.emit("close");
	};

	ChunkStream.prototype._processReadAllowingLess = function (read) {
	  // ok there is any data so that we can satisfy this request
	  this._reads.shift(); // == read

	  // first we need to peek into first buffer
	  let smallerBuf = this._buffers[0];

	  // ok there is more data than we need
	  if (smallerBuf.length > read.length) {
	    this._buffered -= read.length;
	    this._buffers[0] = smallerBuf.slice(read.length);

	    read.func.call(this, smallerBuf.slice(0, read.length));
	  } else {
	    // ok this is less than maximum length so use it all
	    this._buffered -= smallerBuf.length;
	    this._buffers.shift(); // == smallerBuf

	    read.func.call(this, smallerBuf);
	  }
	};

	ChunkStream.prototype._processRead = function (read) {
	  this._reads.shift(); // == read

	  let pos = 0;
	  let count = 0;
	  let data = Buffer.alloc(read.length);

	  // create buffer for all data
	  while (pos < read.length) {
	    let buf = this._buffers[count++];
	    let len = Math.min(buf.length, read.length - pos);

	    buf.copy(data, pos, 0, len);
	    pos += len;

	    // last buffer wasn't used all so just slice it and leave
	    if (len !== buf.length) {
	      this._buffers[--count] = buf.slice(len);
	    }
	  }

	  // remove all used buffers
	  if (count > 0) {
	    this._buffers.splice(0, count);
	  }

	  this._buffered -= read.length;

	  read.func.call(this, data);
	};

	ChunkStream.prototype._process = function () {
	  try {
	    // as long as there is any data and read requests
	    while (this._buffered > 0 && this._reads && this._reads.length > 0) {
	      let read = this._reads[0];

	      // read any data (but no more than length)
	      if (read.allowLess) {
	        this._processReadAllowingLess(read);
	      } else if (this._buffered >= read.length) {
	        // ok we can meet some expectations

	        this._processRead(read);
	      } else {
	        // not enought data to satisfy first request in queue
	        // so we need to wait for more
	        break;
	      }
	    }

	    if (this._buffers && !this.writable) {
	      this._end();
	    }
	  } catch (ex) {
	    this.emit("error", ex);
	  }
	};
	return chunkstream.exports;
}

var filterParseAsync = {exports: {}};

var filterParse = {exports: {}};

var interlace = {};

var hasRequiredInterlace;

function requireInterlace () {
	if (hasRequiredInterlace) return interlace;
	hasRequiredInterlace = 1;

	// Adam 7
	//   0 1 2 3 4 5 6 7
	// 0 x 6 4 6 x 6 4 6
	// 1 7 7 7 7 7 7 7 7
	// 2 5 6 5 6 5 6 5 6
	// 3 7 7 7 7 7 7 7 7
	// 4 3 6 4 6 3 6 4 6
	// 5 7 7 7 7 7 7 7 7
	// 6 5 6 5 6 5 6 5 6
	// 7 7 7 7 7 7 7 7 7

	let imagePasses = [
	  {
	    // pass 1 - 1px
	    x: [0],
	    y: [0],
	  },
	  {
	    // pass 2 - 1px
	    x: [4],
	    y: [0],
	  },
	  {
	    // pass 3 - 2px
	    x: [0, 4],
	    y: [4],
	  },
	  {
	    // pass 4 - 4px
	    x: [2, 6],
	    y: [0, 4],
	  },
	  {
	    // pass 5 - 8px
	    x: [0, 2, 4, 6],
	    y: [2, 6],
	  },
	  {
	    // pass 6 - 16px
	    x: [1, 3, 5, 7],
	    y: [0, 2, 4, 6],
	  },
	  {
	    // pass 7 - 32px
	    x: [0, 1, 2, 3, 4, 5, 6, 7],
	    y: [1, 3, 5, 7],
	  },
	];

	interlace.getImagePasses = function (width, height) {
	  let images = [];
	  let xLeftOver = width % 8;
	  let yLeftOver = height % 8;
	  let xRepeats = (width - xLeftOver) / 8;
	  let yRepeats = (height - yLeftOver) / 8;
	  for (let i = 0; i < imagePasses.length; i++) {
	    let pass = imagePasses[i];
	    let passWidth = xRepeats * pass.x.length;
	    let passHeight = yRepeats * pass.y.length;
	    for (let j = 0; j < pass.x.length; j++) {
	      if (pass.x[j] < xLeftOver) {
	        passWidth++;
	      } else {
	        break;
	      }
	    }
	    for (let j = 0; j < pass.y.length; j++) {
	      if (pass.y[j] < yLeftOver) {
	        passHeight++;
	      } else {
	        break;
	      }
	    }
	    if (passWidth > 0 && passHeight > 0) {
	      images.push({ width: passWidth, height: passHeight, index: i });
	    }
	  }
	  return images;
	};

	interlace.getInterlaceIterator = function (width) {
	  return function (x, y, pass) {
	    let outerXLeftOver = x % imagePasses[pass].x.length;
	    let outerX =
	      ((x - outerXLeftOver) / imagePasses[pass].x.length) * 8 +
	      imagePasses[pass].x[outerXLeftOver];
	    let outerYLeftOver = y % imagePasses[pass].y.length;
	    let outerY =
	      ((y - outerYLeftOver) / imagePasses[pass].y.length) * 8 +
	      imagePasses[pass].y[outerYLeftOver];
	    return outerX * 4 + outerY * width * 4;
	  };
	};
	return interlace;
}

var paethPredictor;
var hasRequiredPaethPredictor;

function requirePaethPredictor () {
	if (hasRequiredPaethPredictor) return paethPredictor;
	hasRequiredPaethPredictor = 1;

	paethPredictor = function paethPredictor(left, above, upLeft) {
	  let paeth = left + above - upLeft;
	  let pLeft = Math.abs(paeth - left);
	  let pAbove = Math.abs(paeth - above);
	  let pUpLeft = Math.abs(paeth - upLeft);

	  if (pLeft <= pAbove && pLeft <= pUpLeft) {
	    return left;
	  }
	  if (pAbove <= pUpLeft) {
	    return above;
	  }
	  return upLeft;
	};
	return paethPredictor;
}

var hasRequiredFilterParse;

function requireFilterParse () {
	if (hasRequiredFilterParse) return filterParse.exports;
	hasRequiredFilterParse = 1;

	let interlaceUtils = requireInterlace();
	let paethPredictor = requirePaethPredictor();

	function getByteWidth(width, bpp, depth) {
	  let byteWidth = width * bpp;
	  if (depth !== 8) {
	    byteWidth = Math.ceil(byteWidth / (8 / depth));
	  }
	  return byteWidth;
	}

	let Filter = (filterParse.exports = function (bitmapInfo, dependencies) {
	  let width = bitmapInfo.width;
	  let height = bitmapInfo.height;
	  let interlace = bitmapInfo.interlace;
	  let bpp = bitmapInfo.bpp;
	  let depth = bitmapInfo.depth;

	  this.read = dependencies.read;
	  this.write = dependencies.write;
	  this.complete = dependencies.complete;

	  this._imageIndex = 0;
	  this._images = [];
	  if (interlace) {
	    let passes = interlaceUtils.getImagePasses(width, height);
	    for (let i = 0; i < passes.length; i++) {
	      this._images.push({
	        byteWidth: getByteWidth(passes[i].width, bpp, depth),
	        height: passes[i].height,
	        lineIndex: 0,
	      });
	    }
	  } else {
	    this._images.push({
	      byteWidth: getByteWidth(width, bpp, depth),
	      height: height,
	      lineIndex: 0,
	    });
	  }

	  // when filtering the line we look at the pixel to the left
	  // the spec also says it is done on a byte level regardless of the number of pixels
	  // so if the depth is byte compatible (8 or 16) we subtract the bpp in order to compare back
	  // a pixel rather than just a different byte part. However if we are sub byte, we ignore.
	  if (depth === 8) {
	    this._xComparison = bpp;
	  } else if (depth === 16) {
	    this._xComparison = bpp * 2;
	  } else {
	    this._xComparison = 1;
	  }
	});

	Filter.prototype.start = function () {
	  this.read(
	    this._images[this._imageIndex].byteWidth + 1,
	    this._reverseFilterLine.bind(this)
	  );
	};

	Filter.prototype._unFilterType1 = function (
	  rawData,
	  unfilteredLine,
	  byteWidth
	) {
	  let xComparison = this._xComparison;
	  let xBiggerThan = xComparison - 1;

	  for (let x = 0; x < byteWidth; x++) {
	    let rawByte = rawData[1 + x];
	    let f1Left = x > xBiggerThan ? unfilteredLine[x - xComparison] : 0;
	    unfilteredLine[x] = rawByte + f1Left;
	  }
	};

	Filter.prototype._unFilterType2 = function (
	  rawData,
	  unfilteredLine,
	  byteWidth
	) {
	  let lastLine = this._lastLine;

	  for (let x = 0; x < byteWidth; x++) {
	    let rawByte = rawData[1 + x];
	    let f2Up = lastLine ? lastLine[x] : 0;
	    unfilteredLine[x] = rawByte + f2Up;
	  }
	};

	Filter.prototype._unFilterType3 = function (
	  rawData,
	  unfilteredLine,
	  byteWidth
	) {
	  let xComparison = this._xComparison;
	  let xBiggerThan = xComparison - 1;
	  let lastLine = this._lastLine;

	  for (let x = 0; x < byteWidth; x++) {
	    let rawByte = rawData[1 + x];
	    let f3Up = lastLine ? lastLine[x] : 0;
	    let f3Left = x > xBiggerThan ? unfilteredLine[x - xComparison] : 0;
	    let f3Add = Math.floor((f3Left + f3Up) / 2);
	    unfilteredLine[x] = rawByte + f3Add;
	  }
	};

	Filter.prototype._unFilterType4 = function (
	  rawData,
	  unfilteredLine,
	  byteWidth
	) {
	  let xComparison = this._xComparison;
	  let xBiggerThan = xComparison - 1;
	  let lastLine = this._lastLine;

	  for (let x = 0; x < byteWidth; x++) {
	    let rawByte = rawData[1 + x];
	    let f4Up = lastLine ? lastLine[x] : 0;
	    let f4Left = x > xBiggerThan ? unfilteredLine[x - xComparison] : 0;
	    let f4UpLeft = x > xBiggerThan && lastLine ? lastLine[x - xComparison] : 0;
	    let f4Add = paethPredictor(f4Left, f4Up, f4UpLeft);
	    unfilteredLine[x] = rawByte + f4Add;
	  }
	};

	Filter.prototype._reverseFilterLine = function (rawData) {
	  let filter = rawData[0];
	  let unfilteredLine;
	  let currentImage = this._images[this._imageIndex];
	  let byteWidth = currentImage.byteWidth;

	  if (filter === 0) {
	    unfilteredLine = rawData.slice(1, byteWidth + 1);
	  } else {
	    unfilteredLine = Buffer.alloc(byteWidth);

	    switch (filter) {
	      case 1:
	        this._unFilterType1(rawData, unfilteredLine, byteWidth);
	        break;
	      case 2:
	        this._unFilterType2(rawData, unfilteredLine, byteWidth);
	        break;
	      case 3:
	        this._unFilterType3(rawData, unfilteredLine, byteWidth);
	        break;
	      case 4:
	        this._unFilterType4(rawData, unfilteredLine, byteWidth);
	        break;
	      default:
	        throw new Error("Unrecognised filter type - " + filter);
	    }
	  }

	  this.write(unfilteredLine);

	  currentImage.lineIndex++;
	  if (currentImage.lineIndex >= currentImage.height) {
	    this._lastLine = null;
	    this._imageIndex++;
	    currentImage = this._images[this._imageIndex];
	  } else {
	    this._lastLine = unfilteredLine;
	  }

	  if (currentImage) {
	    // read, using the byte width that may be from the new current image
	    this.read(currentImage.byteWidth + 1, this._reverseFilterLine.bind(this));
	  } else {
	    this._lastLine = null;
	    this.complete();
	  }
	};
	return filterParse.exports;
}

var hasRequiredFilterParseAsync;

function requireFilterParseAsync () {
	if (hasRequiredFilterParseAsync) return filterParseAsync.exports;
	hasRequiredFilterParseAsync = 1;

	let util = require$$0$3;
	let ChunkStream = requireChunkstream();
	let Filter = requireFilterParse();

	let FilterAsync = (filterParseAsync.exports = function (bitmapInfo) {
	  ChunkStream.call(this);

	  let buffers = [];
	  let that = this;
	  this._filter = new Filter(bitmapInfo, {
	    read: this.read.bind(this),
	    write: function (buffer) {
	      buffers.push(buffer);
	    },
	    complete: function () {
	      that.emit("complete", Buffer.concat(buffers));
	    },
	  });

	  this._filter.start();
	});
	util.inherits(FilterAsync, ChunkStream);
	return filterParseAsync.exports;
}

var parser = {exports: {}};

var constants;
var hasRequiredConstants;

function requireConstants () {
	if (hasRequiredConstants) return constants;
	hasRequiredConstants = 1;

	constants = {
	  PNG_SIGNATURE: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],

	  TYPE_IHDR: 0x49484452,
	  TYPE_IEND: 0x49454e44,
	  TYPE_IDAT: 0x49444154,
	  TYPE_PLTE: 0x504c5445,
	  TYPE_tRNS: 0x74524e53, // eslint-disable-line camelcase
	  TYPE_gAMA: 0x67414d41, // eslint-disable-line camelcase

	  // color-type bits
	  COLORTYPE_GRAYSCALE: 0,
	  COLORTYPE_PALETTE: 1,
	  COLORTYPE_COLOR: 2,
	  COLORTYPE_ALPHA: 4, // e.g. grayscale and alpha

	  // color-type combinations
	  COLORTYPE_PALETTE_COLOR: 3,
	  COLORTYPE_COLOR_ALPHA: 6,

	  COLORTYPE_TO_BPP_MAP: {
	    0: 1,
	    2: 3,
	    3: 1,
	    4: 2,
	    6: 4,
	  },

	  GAMMA_DIVISION: 100000,
	};
	return constants;
}

var crc = {exports: {}};

var hasRequiredCrc;

function requireCrc () {
	if (hasRequiredCrc) return crc.exports;
	hasRequiredCrc = 1;

	let crcTable = [];

	(function () {
	  for (let i = 0; i < 256; i++) {
	    let currentCrc = i;
	    for (let j = 0; j < 8; j++) {
	      if (currentCrc & 1) {
	        currentCrc = 0xedb88320 ^ (currentCrc >>> 1);
	      } else {
	        currentCrc = currentCrc >>> 1;
	      }
	    }
	    crcTable[i] = currentCrc;
	  }
	})();

	let CrcCalculator = (crc.exports = function () {
	  this._crc = -1;
	});

	CrcCalculator.prototype.write = function (data) {
	  for (let i = 0; i < data.length; i++) {
	    this._crc = crcTable[(this._crc ^ data[i]) & 0xff] ^ (this._crc >>> 8);
	  }
	  return true;
	};

	CrcCalculator.prototype.crc32 = function () {
	  return this._crc ^ -1;
	};

	CrcCalculator.crc32 = function (buf) {
	  let crc = -1;
	  for (let i = 0; i < buf.length; i++) {
	    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
	  }
	  return crc ^ -1;
	};
	return crc.exports;
}

var hasRequiredParser;

function requireParser () {
	if (hasRequiredParser) return parser.exports;
	hasRequiredParser = 1;

	let constants = requireConstants();
	let CrcCalculator = requireCrc();

	let Parser = (parser.exports = function (options, dependencies) {
	  this._options = options;
	  options.checkCRC = options.checkCRC !== false;

	  this._hasIHDR = false;
	  this._hasIEND = false;
	  this._emittedHeadersFinished = false;

	  // input flags/metadata
	  this._palette = [];
	  this._colorType = 0;

	  this._chunks = {};
	  this._chunks[constants.TYPE_IHDR] = this._handleIHDR.bind(this);
	  this._chunks[constants.TYPE_IEND] = this._handleIEND.bind(this);
	  this._chunks[constants.TYPE_IDAT] = this._handleIDAT.bind(this);
	  this._chunks[constants.TYPE_PLTE] = this._handlePLTE.bind(this);
	  this._chunks[constants.TYPE_tRNS] = this._handleTRNS.bind(this);
	  this._chunks[constants.TYPE_gAMA] = this._handleGAMA.bind(this);

	  this.read = dependencies.read;
	  this.error = dependencies.error;
	  this.metadata = dependencies.metadata;
	  this.gamma = dependencies.gamma;
	  this.transColor = dependencies.transColor;
	  this.palette = dependencies.palette;
	  this.parsed = dependencies.parsed;
	  this.inflateData = dependencies.inflateData;
	  this.finished = dependencies.finished;
	  this.simpleTransparency = dependencies.simpleTransparency;
	  this.headersFinished = dependencies.headersFinished || function () {};
	});

	Parser.prototype.start = function () {
	  this.read(constants.PNG_SIGNATURE.length, this._parseSignature.bind(this));
	};

	Parser.prototype._parseSignature = function (data) {
	  let signature = constants.PNG_SIGNATURE;

	  for (let i = 0; i < signature.length; i++) {
	    if (data[i] !== signature[i]) {
	      this.error(new Error("Invalid file signature"));
	      return;
	    }
	  }
	  this.read(8, this._parseChunkBegin.bind(this));
	};

	Parser.prototype._parseChunkBegin = function (data) {
	  // chunk content length
	  let length = data.readUInt32BE(0);

	  // chunk type
	  let type = data.readUInt32BE(4);
	  let name = "";
	  for (let i = 4; i < 8; i++) {
	    name += String.fromCharCode(data[i]);
	  }

	  //console.log('chunk ', name, length);

	  // chunk flags
	  let ancillary = Boolean(data[4] & 0x20); // or critical
	  //    priv = Boolean(data[5] & 0x20), // or public
	  //    safeToCopy = Boolean(data[7] & 0x20); // or unsafe

	  if (!this._hasIHDR && type !== constants.TYPE_IHDR) {
	    this.error(new Error("Expected IHDR on beggining"));
	    return;
	  }

	  this._crc = new CrcCalculator();
	  this._crc.write(Buffer.from(name));

	  if (this._chunks[type]) {
	    return this._chunks[type](length);
	  }

	  if (!ancillary) {
	    this.error(new Error("Unsupported critical chunk type " + name));
	    return;
	  }

	  this.read(length + 4, this._skipChunk.bind(this));
	};

	Parser.prototype._skipChunk = function (/*data*/) {
	  this.read(8, this._parseChunkBegin.bind(this));
	};

	Parser.prototype._handleChunkEnd = function () {
	  this.read(4, this._parseChunkEnd.bind(this));
	};

	Parser.prototype._parseChunkEnd = function (data) {
	  let fileCrc = data.readInt32BE(0);
	  let calcCrc = this._crc.crc32();

	  // check CRC
	  if (this._options.checkCRC && calcCrc !== fileCrc) {
	    this.error(new Error("Crc error - " + fileCrc + " - " + calcCrc));
	    return;
	  }

	  if (!this._hasIEND) {
	    this.read(8, this._parseChunkBegin.bind(this));
	  }
	};

	Parser.prototype._handleIHDR = function (length) {
	  this.read(length, this._parseIHDR.bind(this));
	};
	Parser.prototype._parseIHDR = function (data) {
	  this._crc.write(data);

	  let width = data.readUInt32BE(0);
	  let height = data.readUInt32BE(4);
	  let depth = data[8];
	  let colorType = data[9]; // bits: 1 palette, 2 color, 4 alpha
	  let compr = data[10];
	  let filter = data[11];
	  let interlace = data[12];

	  // console.log('    width', width, 'height', height,
	  //     'depth', depth, 'colorType', colorType,
	  //     'compr', compr, 'filter', filter, 'interlace', interlace
	  // );

	  if (
	    depth !== 8 &&
	    depth !== 4 &&
	    depth !== 2 &&
	    depth !== 1 &&
	    depth !== 16
	  ) {
	    this.error(new Error("Unsupported bit depth " + depth));
	    return;
	  }
	  if (!(colorType in constants.COLORTYPE_TO_BPP_MAP)) {
	    this.error(new Error("Unsupported color type"));
	    return;
	  }
	  if (compr !== 0) {
	    this.error(new Error("Unsupported compression method"));
	    return;
	  }
	  if (filter !== 0) {
	    this.error(new Error("Unsupported filter method"));
	    return;
	  }
	  if (interlace !== 0 && interlace !== 1) {
	    this.error(new Error("Unsupported interlace method"));
	    return;
	  }

	  this._colorType = colorType;

	  let bpp = constants.COLORTYPE_TO_BPP_MAP[this._colorType];

	  this._hasIHDR = true;

	  this.metadata({
	    width: width,
	    height: height,
	    depth: depth,
	    interlace: Boolean(interlace),
	    palette: Boolean(colorType & constants.COLORTYPE_PALETTE),
	    color: Boolean(colorType & constants.COLORTYPE_COLOR),
	    alpha: Boolean(colorType & constants.COLORTYPE_ALPHA),
	    bpp: bpp,
	    colorType: colorType,
	  });

	  this._handleChunkEnd();
	};

	Parser.prototype._handlePLTE = function (length) {
	  this.read(length, this._parsePLTE.bind(this));
	};
	Parser.prototype._parsePLTE = function (data) {
	  this._crc.write(data);

	  let entries = Math.floor(data.length / 3);
	  // console.log('Palette:', entries);

	  for (let i = 0; i < entries; i++) {
	    this._palette.push([data[i * 3], data[i * 3 + 1], data[i * 3 + 2], 0xff]);
	  }

	  this.palette(this._palette);

	  this._handleChunkEnd();
	};

	Parser.prototype._handleTRNS = function (length) {
	  this.simpleTransparency();
	  this.read(length, this._parseTRNS.bind(this));
	};
	Parser.prototype._parseTRNS = function (data) {
	  this._crc.write(data);

	  // palette
	  if (this._colorType === constants.COLORTYPE_PALETTE_COLOR) {
	    if (this._palette.length === 0) {
	      this.error(new Error("Transparency chunk must be after palette"));
	      return;
	    }
	    if (data.length > this._palette.length) {
	      this.error(new Error("More transparent colors than palette size"));
	      return;
	    }
	    for (let i = 0; i < data.length; i++) {
	      this._palette[i][3] = data[i];
	    }
	    this.palette(this._palette);
	  }

	  // for colorType 0 (grayscale) and 2 (rgb)
	  // there might be one gray/color defined as transparent
	  if (this._colorType === constants.COLORTYPE_GRAYSCALE) {
	    // grey, 2 bytes
	    this.transColor([data.readUInt16BE(0)]);
	  }
	  if (this._colorType === constants.COLORTYPE_COLOR) {
	    this.transColor([
	      data.readUInt16BE(0),
	      data.readUInt16BE(2),
	      data.readUInt16BE(4),
	    ]);
	  }

	  this._handleChunkEnd();
	};

	Parser.prototype._handleGAMA = function (length) {
	  this.read(length, this._parseGAMA.bind(this));
	};
	Parser.prototype._parseGAMA = function (data) {
	  this._crc.write(data);
	  this.gamma(data.readUInt32BE(0) / constants.GAMMA_DIVISION);

	  this._handleChunkEnd();
	};

	Parser.prototype._handleIDAT = function (length) {
	  if (!this._emittedHeadersFinished) {
	    this._emittedHeadersFinished = true;
	    this.headersFinished();
	  }
	  this.read(-length, this._parseIDAT.bind(this, length));
	};
	Parser.prototype._parseIDAT = function (length, data) {
	  this._crc.write(data);

	  if (
	    this._colorType === constants.COLORTYPE_PALETTE_COLOR &&
	    this._palette.length === 0
	  ) {
	    throw new Error("Expected palette not found");
	  }

	  this.inflateData(data);
	  let leftOverLength = length - data.length;

	  if (leftOverLength > 0) {
	    this._handleIDAT(leftOverLength);
	  } else {
	    this._handleChunkEnd();
	  }
	};

	Parser.prototype._handleIEND = function (length) {
	  this.read(length, this._parseIEND.bind(this));
	};
	Parser.prototype._parseIEND = function (data) {
	  this._crc.write(data);

	  this._hasIEND = true;
	  this._handleChunkEnd();

	  if (this.finished) {
	    this.finished();
	  }
	};
	return parser.exports;
}

var bitmapper = {};

var hasRequiredBitmapper;

function requireBitmapper () {
	if (hasRequiredBitmapper) return bitmapper;
	hasRequiredBitmapper = 1;

	let interlaceUtils = requireInterlace();

	let pixelBppMapper = [
	  // 0 - dummy entry
	  function () {},

	  // 1 - L
	  // 0: 0, 1: 0, 2: 0, 3: 0xff
	  function (pxData, data, pxPos, rawPos) {
	    if (rawPos === data.length) {
	      throw new Error("Ran out of data");
	    }

	    let pixel = data[rawPos];
	    pxData[pxPos] = pixel;
	    pxData[pxPos + 1] = pixel;
	    pxData[pxPos + 2] = pixel;
	    pxData[pxPos + 3] = 0xff;
	  },

	  // 2 - LA
	  // 0: 0, 1: 0, 2: 0, 3: 1
	  function (pxData, data, pxPos, rawPos) {
	    if (rawPos + 1 >= data.length) {
	      throw new Error("Ran out of data");
	    }

	    let pixel = data[rawPos];
	    pxData[pxPos] = pixel;
	    pxData[pxPos + 1] = pixel;
	    pxData[pxPos + 2] = pixel;
	    pxData[pxPos + 3] = data[rawPos + 1];
	  },

	  // 3 - RGB
	  // 0: 0, 1: 1, 2: 2, 3: 0xff
	  function (pxData, data, pxPos, rawPos) {
	    if (rawPos + 2 >= data.length) {
	      throw new Error("Ran out of data");
	    }

	    pxData[pxPos] = data[rawPos];
	    pxData[pxPos + 1] = data[rawPos + 1];
	    pxData[pxPos + 2] = data[rawPos + 2];
	    pxData[pxPos + 3] = 0xff;
	  },

	  // 4 - RGBA
	  // 0: 0, 1: 1, 2: 2, 3: 3
	  function (pxData, data, pxPos, rawPos) {
	    if (rawPos + 3 >= data.length) {
	      throw new Error("Ran out of data");
	    }

	    pxData[pxPos] = data[rawPos];
	    pxData[pxPos + 1] = data[rawPos + 1];
	    pxData[pxPos + 2] = data[rawPos + 2];
	    pxData[pxPos + 3] = data[rawPos + 3];
	  },
	];

	let pixelBppCustomMapper = [
	  // 0 - dummy entry
	  function () {},

	  // 1 - L
	  // 0: 0, 1: 0, 2: 0, 3: 0xff
	  function (pxData, pixelData, pxPos, maxBit) {
	    let pixel = pixelData[0];
	    pxData[pxPos] = pixel;
	    pxData[pxPos + 1] = pixel;
	    pxData[pxPos + 2] = pixel;
	    pxData[pxPos + 3] = maxBit;
	  },

	  // 2 - LA
	  // 0: 0, 1: 0, 2: 0, 3: 1
	  function (pxData, pixelData, pxPos) {
	    let pixel = pixelData[0];
	    pxData[pxPos] = pixel;
	    pxData[pxPos + 1] = pixel;
	    pxData[pxPos + 2] = pixel;
	    pxData[pxPos + 3] = pixelData[1];
	  },

	  // 3 - RGB
	  // 0: 0, 1: 1, 2: 2, 3: 0xff
	  function (pxData, pixelData, pxPos, maxBit) {
	    pxData[pxPos] = pixelData[0];
	    pxData[pxPos + 1] = pixelData[1];
	    pxData[pxPos + 2] = pixelData[2];
	    pxData[pxPos + 3] = maxBit;
	  },

	  // 4 - RGBA
	  // 0: 0, 1: 1, 2: 2, 3: 3
	  function (pxData, pixelData, pxPos) {
	    pxData[pxPos] = pixelData[0];
	    pxData[pxPos + 1] = pixelData[1];
	    pxData[pxPos + 2] = pixelData[2];
	    pxData[pxPos + 3] = pixelData[3];
	  },
	];

	function bitRetriever(data, depth) {
	  let leftOver = [];
	  let i = 0;

	  function split() {
	    if (i === data.length) {
	      throw new Error("Ran out of data");
	    }
	    let byte = data[i];
	    i++;
	    let byte8, byte7, byte6, byte5, byte4, byte3, byte2, byte1;
	    switch (depth) {
	      default:
	        throw new Error("unrecognised depth");
	      case 16:
	        byte2 = data[i];
	        i++;
	        leftOver.push((byte << 8) + byte2);
	        break;
	      case 4:
	        byte2 = byte & 0x0f;
	        byte1 = byte >> 4;
	        leftOver.push(byte1, byte2);
	        break;
	      case 2:
	        byte4 = byte & 3;
	        byte3 = (byte >> 2) & 3;
	        byte2 = (byte >> 4) & 3;
	        byte1 = (byte >> 6) & 3;
	        leftOver.push(byte1, byte2, byte3, byte4);
	        break;
	      case 1:
	        byte8 = byte & 1;
	        byte7 = (byte >> 1) & 1;
	        byte6 = (byte >> 2) & 1;
	        byte5 = (byte >> 3) & 1;
	        byte4 = (byte >> 4) & 1;
	        byte3 = (byte >> 5) & 1;
	        byte2 = (byte >> 6) & 1;
	        byte1 = (byte >> 7) & 1;
	        leftOver.push(byte1, byte2, byte3, byte4, byte5, byte6, byte7, byte8);
	        break;
	    }
	  }

	  return {
	    get: function (count) {
	      while (leftOver.length < count) {
	        split();
	      }
	      let returner = leftOver.slice(0, count);
	      leftOver = leftOver.slice(count);
	      return returner;
	    },
	    resetAfterLine: function () {
	      leftOver.length = 0;
	    },
	    end: function () {
	      if (i !== data.length) {
	        throw new Error("extra data found");
	      }
	    },
	  };
	}

	function mapImage8Bit(image, pxData, getPxPos, bpp, data, rawPos) {
	  // eslint-disable-line max-params
	  let imageWidth = image.width;
	  let imageHeight = image.height;
	  let imagePass = image.index;
	  for (let y = 0; y < imageHeight; y++) {
	    for (let x = 0; x < imageWidth; x++) {
	      let pxPos = getPxPos(x, y, imagePass);
	      pixelBppMapper[bpp](pxData, data, pxPos, rawPos);
	      rawPos += bpp; //eslint-disable-line no-param-reassign
	    }
	  }
	  return rawPos;
	}

	function mapImageCustomBit(image, pxData, getPxPos, bpp, bits, maxBit) {
	  // eslint-disable-line max-params
	  let imageWidth = image.width;
	  let imageHeight = image.height;
	  let imagePass = image.index;
	  for (let y = 0; y < imageHeight; y++) {
	    for (let x = 0; x < imageWidth; x++) {
	      let pixelData = bits.get(bpp);
	      let pxPos = getPxPos(x, y, imagePass);
	      pixelBppCustomMapper[bpp](pxData, pixelData, pxPos, maxBit);
	    }
	    bits.resetAfterLine();
	  }
	}

	bitmapper.dataToBitMap = function (data, bitmapInfo) {
	  let width = bitmapInfo.width;
	  let height = bitmapInfo.height;
	  let depth = bitmapInfo.depth;
	  let bpp = bitmapInfo.bpp;
	  let interlace = bitmapInfo.interlace;
	  let bits;

	  if (depth !== 8) {
	    bits = bitRetriever(data, depth);
	  }
	  let pxData;
	  if (depth <= 8) {
	    pxData = Buffer.alloc(width * height * 4);
	  } else {
	    pxData = new Uint16Array(width * height * 4);
	  }
	  let maxBit = Math.pow(2, depth) - 1;
	  let rawPos = 0;
	  let images;
	  let getPxPos;

	  if (interlace) {
	    images = interlaceUtils.getImagePasses(width, height);
	    getPxPos = interlaceUtils.getInterlaceIterator(width, height);
	  } else {
	    let nonInterlacedPxPos = 0;
	    getPxPos = function () {
	      let returner = nonInterlacedPxPos;
	      nonInterlacedPxPos += 4;
	      return returner;
	    };
	    images = [{ width: width, height: height }];
	  }

	  for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
	    if (depth === 8) {
	      rawPos = mapImage8Bit(
	        images[imageIndex],
	        pxData,
	        getPxPos,
	        bpp,
	        data,
	        rawPos
	      );
	    } else {
	      mapImageCustomBit(
	        images[imageIndex],
	        pxData,
	        getPxPos,
	        bpp,
	        bits,
	        maxBit
	      );
	    }
	  }
	  if (depth === 8) {
	    if (rawPos !== data.length) {
	      throw new Error("extra data found");
	    }
	  } else {
	    bits.end();
	  }

	  return pxData;
	};
	return bitmapper;
}

var formatNormaliser;
var hasRequiredFormatNormaliser;

function requireFormatNormaliser () {
	if (hasRequiredFormatNormaliser) return formatNormaliser;
	hasRequiredFormatNormaliser = 1;

	function dePalette(indata, outdata, width, height, palette) {
	  let pxPos = 0;
	  // use values from palette
	  for (let y = 0; y < height; y++) {
	    for (let x = 0; x < width; x++) {
	      let color = palette[indata[pxPos]];

	      if (!color) {
	        throw new Error("index " + indata[pxPos] + " not in palette");
	      }

	      for (let i = 0; i < 4; i++) {
	        outdata[pxPos + i] = color[i];
	      }
	      pxPos += 4;
	    }
	  }
	}

	function replaceTransparentColor(indata, outdata, width, height, transColor) {
	  let pxPos = 0;
	  for (let y = 0; y < height; y++) {
	    for (let x = 0; x < width; x++) {
	      let makeTrans = false;

	      if (transColor.length === 1) {
	        if (transColor[0] === indata[pxPos]) {
	          makeTrans = true;
	        }
	      } else if (
	        transColor[0] === indata[pxPos] &&
	        transColor[1] === indata[pxPos + 1] &&
	        transColor[2] === indata[pxPos + 2]
	      ) {
	        makeTrans = true;
	      }
	      if (makeTrans) {
	        for (let i = 0; i < 4; i++) {
	          outdata[pxPos + i] = 0;
	        }
	      }
	      pxPos += 4;
	    }
	  }
	}

	function scaleDepth(indata, outdata, width, height, depth) {
	  let maxOutSample = 255;
	  let maxInSample = Math.pow(2, depth) - 1;
	  let pxPos = 0;

	  for (let y = 0; y < height; y++) {
	    for (let x = 0; x < width; x++) {
	      for (let i = 0; i < 4; i++) {
	        outdata[pxPos + i] = Math.floor(
	          (indata[pxPos + i] * maxOutSample) / maxInSample + 0.5
	        );
	      }
	      pxPos += 4;
	    }
	  }
	}

	formatNormaliser = function (indata, imageData, skipRescale = false) {
	  let depth = imageData.depth;
	  let width = imageData.width;
	  let height = imageData.height;
	  let colorType = imageData.colorType;
	  let transColor = imageData.transColor;
	  let palette = imageData.palette;

	  let outdata = indata; // only different for 16 bits

	  if (colorType === 3) {
	    // paletted
	    dePalette(indata, outdata, width, height, palette);
	  } else {
	    if (transColor) {
	      replaceTransparentColor(indata, outdata, width, height, transColor);
	    }
	    // if it needs scaling
	    if (depth !== 8 && !skipRescale) {
	      // if we need to change the buffer size
	      if (depth === 16) {
	        outdata = Buffer.alloc(width * height * 4);
	      }
	      scaleDepth(indata, outdata, width, height, depth);
	    }
	  }
	  return outdata;
	};
	return formatNormaliser;
}

var hasRequiredParserAsync;

function requireParserAsync () {
	if (hasRequiredParserAsync) return parserAsync.exports;
	hasRequiredParserAsync = 1;

	let util = require$$0$3;
	let zlib = require$$0;
	let ChunkStream = requireChunkstream();
	let FilterAsync = requireFilterParseAsync();
	let Parser = requireParser();
	let bitmapper = requireBitmapper();
	let formatNormaliser = requireFormatNormaliser();

	let ParserAsync = (parserAsync.exports = function (options) {
	  ChunkStream.call(this);

	  this._parser = new Parser(options, {
	    read: this.read.bind(this),
	    error: this._handleError.bind(this),
	    metadata: this._handleMetaData.bind(this),
	    gamma: this.emit.bind(this, "gamma"),
	    palette: this._handlePalette.bind(this),
	    transColor: this._handleTransColor.bind(this),
	    finished: this._finished.bind(this),
	    inflateData: this._inflateData.bind(this),
	    simpleTransparency: this._simpleTransparency.bind(this),
	    headersFinished: this._headersFinished.bind(this),
	  });
	  this._options = options;
	  this.writable = true;

	  this._parser.start();
	});
	util.inherits(ParserAsync, ChunkStream);

	ParserAsync.prototype._handleError = function (err) {
	  this.emit("error", err);

	  this.writable = false;

	  this.destroy();

	  if (this._inflate && this._inflate.destroy) {
	    this._inflate.destroy();
	  }

	  if (this._filter) {
	    this._filter.destroy();
	    // For backward compatibility with Node 7 and below.
	    // Suppress errors due to _inflate calling write() even after
	    // it's destroy()'ed.
	    this._filter.on("error", function () {});
	  }

	  this.errord = true;
	};

	ParserAsync.prototype._inflateData = function (data) {
	  if (!this._inflate) {
	    if (this._bitmapInfo.interlace) {
	      this._inflate = zlib.createInflate();

	      this._inflate.on("error", this.emit.bind(this, "error"));
	      this._filter.on("complete", this._complete.bind(this));

	      this._inflate.pipe(this._filter);
	    } else {
	      let rowSize =
	        ((this._bitmapInfo.width *
	          this._bitmapInfo.bpp *
	          this._bitmapInfo.depth +
	          7) >>
	          3) +
	        1;
	      let imageSize = rowSize * this._bitmapInfo.height;
	      let chunkSize = Math.max(imageSize, zlib.Z_MIN_CHUNK);

	      this._inflate = zlib.createInflate({ chunkSize: chunkSize });
	      let leftToInflate = imageSize;

	      let emitError = this.emit.bind(this, "error");
	      this._inflate.on("error", function (err) {
	        if (!leftToInflate) {
	          return;
	        }

	        emitError(err);
	      });
	      this._filter.on("complete", this._complete.bind(this));

	      let filterWrite = this._filter.write.bind(this._filter);
	      this._inflate.on("data", function (chunk) {
	        if (!leftToInflate) {
	          return;
	        }

	        if (chunk.length > leftToInflate) {
	          chunk = chunk.slice(0, leftToInflate);
	        }

	        leftToInflate -= chunk.length;

	        filterWrite(chunk);
	      });

	      this._inflate.on("end", this._filter.end.bind(this._filter));
	    }
	  }
	  this._inflate.write(data);
	};

	ParserAsync.prototype._handleMetaData = function (metaData) {
	  this._metaData = metaData;
	  this._bitmapInfo = Object.create(metaData);

	  this._filter = new FilterAsync(this._bitmapInfo);
	};

	ParserAsync.prototype._handleTransColor = function (transColor) {
	  this._bitmapInfo.transColor = transColor;
	};

	ParserAsync.prototype._handlePalette = function (palette) {
	  this._bitmapInfo.palette = palette;
	};

	ParserAsync.prototype._simpleTransparency = function () {
	  this._metaData.alpha = true;
	};

	ParserAsync.prototype._headersFinished = function () {
	  // Up until this point, we don't know if we have a tRNS chunk (alpha)
	  // so we can't emit metadata any earlier
	  this.emit("metadata", this._metaData);
	};

	ParserAsync.prototype._finished = function () {
	  if (this.errord) {
	    return;
	  }

	  if (!this._inflate) {
	    this.emit("error", "No Inflate block");
	  } else {
	    // no more data to inflate
	    this._inflate.end();
	  }
	};

	ParserAsync.prototype._complete = function (filteredData) {
	  if (this.errord) {
	    return;
	  }

	  let normalisedBitmapData;

	  try {
	    let bitmapData = bitmapper.dataToBitMap(filteredData, this._bitmapInfo);

	    normalisedBitmapData = formatNormaliser(
	      bitmapData,
	      this._bitmapInfo,
	      this._options.skipRescale
	    );
	    bitmapData = null;
	  } catch (ex) {
	    this._handleError(ex);
	    return;
	  }

	  this.emit("parsed", normalisedBitmapData);
	};
	return parserAsync.exports;
}

var packerAsync = {exports: {}};

var packer = {exports: {}};

var bitpacker;
var hasRequiredBitpacker;

function requireBitpacker () {
	if (hasRequiredBitpacker) return bitpacker;
	hasRequiredBitpacker = 1;

	let constants = requireConstants();

	bitpacker = function (dataIn, width, height, options) {
	  let outHasAlpha =
	    [constants.COLORTYPE_COLOR_ALPHA, constants.COLORTYPE_ALPHA].indexOf(
	      options.colorType
	    ) !== -1;
	  if (options.colorType === options.inputColorType) {
	    let bigEndian = (function () {
	      let buffer = new ArrayBuffer(2);
	      new DataView(buffer).setInt16(0, 256, true /* littleEndian */);
	      // Int16Array uses the platform's endianness.
	      return new Int16Array(buffer)[0] !== 256;
	    })();
	    // If no need to convert to grayscale and alpha is present/absent in both, take a fast route
	    if (options.bitDepth === 8 || (options.bitDepth === 16 && bigEndian)) {
	      return dataIn;
	    }
	  }

	  // map to a UInt16 array if data is 16bit, fix endianness below
	  let data = options.bitDepth !== 16 ? dataIn : new Uint16Array(dataIn.buffer);

	  let maxValue = 255;
	  let inBpp = constants.COLORTYPE_TO_BPP_MAP[options.inputColorType];
	  if (inBpp === 4 && !options.inputHasAlpha) {
	    inBpp = 3;
	  }
	  let outBpp = constants.COLORTYPE_TO_BPP_MAP[options.colorType];
	  if (options.bitDepth === 16) {
	    maxValue = 65535;
	    outBpp *= 2;
	  }
	  let outData = Buffer.alloc(width * height * outBpp);

	  let inIndex = 0;
	  let outIndex = 0;

	  let bgColor = options.bgColor || {};
	  if (bgColor.red === undefined) {
	    bgColor.red = maxValue;
	  }
	  if (bgColor.green === undefined) {
	    bgColor.green = maxValue;
	  }
	  if (bgColor.blue === undefined) {
	    bgColor.blue = maxValue;
	  }

	  function getRGBA() {
	    let red;
	    let green;
	    let blue;
	    let alpha = maxValue;
	    switch (options.inputColorType) {
	      case constants.COLORTYPE_COLOR_ALPHA:
	        alpha = data[inIndex + 3];
	        red = data[inIndex];
	        green = data[inIndex + 1];
	        blue = data[inIndex + 2];
	        break;
	      case constants.COLORTYPE_COLOR:
	        red = data[inIndex];
	        green = data[inIndex + 1];
	        blue = data[inIndex + 2];
	        break;
	      case constants.COLORTYPE_ALPHA:
	        alpha = data[inIndex + 1];
	        red = data[inIndex];
	        green = red;
	        blue = red;
	        break;
	      case constants.COLORTYPE_GRAYSCALE:
	        red = data[inIndex];
	        green = red;
	        blue = red;
	        break;
	      default:
	        throw new Error(
	          "input color type:" +
	            options.inputColorType +
	            " is not supported at present"
	        );
	    }

	    if (options.inputHasAlpha) {
	      if (!outHasAlpha) {
	        alpha /= maxValue;
	        red = Math.min(
	          Math.max(Math.round((1 - alpha) * bgColor.red + alpha * red), 0),
	          maxValue
	        );
	        green = Math.min(
	          Math.max(Math.round((1 - alpha) * bgColor.green + alpha * green), 0),
	          maxValue
	        );
	        blue = Math.min(
	          Math.max(Math.round((1 - alpha) * bgColor.blue + alpha * blue), 0),
	          maxValue
	        );
	      }
	    }
	    return { red: red, green: green, blue: blue, alpha: alpha };
	  }

	  for (let y = 0; y < height; y++) {
	    for (let x = 0; x < width; x++) {
	      let rgba = getRGBA();

	      switch (options.colorType) {
	        case constants.COLORTYPE_COLOR_ALPHA:
	        case constants.COLORTYPE_COLOR:
	          if (options.bitDepth === 8) {
	            outData[outIndex] = rgba.red;
	            outData[outIndex + 1] = rgba.green;
	            outData[outIndex + 2] = rgba.blue;
	            if (outHasAlpha) {
	              outData[outIndex + 3] = rgba.alpha;
	            }
	          } else {
	            outData.writeUInt16BE(rgba.red, outIndex);
	            outData.writeUInt16BE(rgba.green, outIndex + 2);
	            outData.writeUInt16BE(rgba.blue, outIndex + 4);
	            if (outHasAlpha) {
	              outData.writeUInt16BE(rgba.alpha, outIndex + 6);
	            }
	          }
	          break;
	        case constants.COLORTYPE_ALPHA:
	        case constants.COLORTYPE_GRAYSCALE: {
	          // Convert to grayscale and alpha
	          let grayscale = (rgba.red + rgba.green + rgba.blue) / 3;
	          if (options.bitDepth === 8) {
	            outData[outIndex] = grayscale;
	            if (outHasAlpha) {
	              outData[outIndex + 1] = rgba.alpha;
	            }
	          } else {
	            outData.writeUInt16BE(grayscale, outIndex);
	            if (outHasAlpha) {
	              outData.writeUInt16BE(rgba.alpha, outIndex + 2);
	            }
	          }
	          break;
	        }
	        default:
	          throw new Error("unrecognised color Type " + options.colorType);
	      }

	      inIndex += inBpp;
	      outIndex += outBpp;
	    }
	  }

	  return outData;
	};
	return bitpacker;
}

var filterPack;
var hasRequiredFilterPack;

function requireFilterPack () {
	if (hasRequiredFilterPack) return filterPack;
	hasRequiredFilterPack = 1;

	let paethPredictor = requirePaethPredictor();

	function filterNone(pxData, pxPos, byteWidth, rawData, rawPos) {
	  for (let x = 0; x < byteWidth; x++) {
	    rawData[rawPos + x] = pxData[pxPos + x];
	  }
	}

	function filterSumNone(pxData, pxPos, byteWidth) {
	  let sum = 0;
	  let length = pxPos + byteWidth;

	  for (let i = pxPos; i < length; i++) {
	    sum += Math.abs(pxData[i]);
	  }
	  return sum;
	}

	function filterSub(pxData, pxPos, byteWidth, rawData, rawPos, bpp) {
	  for (let x = 0; x < byteWidth; x++) {
	    let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
	    let val = pxData[pxPos + x] - left;

	    rawData[rawPos + x] = val;
	  }
	}

	function filterSumSub(pxData, pxPos, byteWidth, bpp) {
	  let sum = 0;
	  for (let x = 0; x < byteWidth; x++) {
	    let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
	    let val = pxData[pxPos + x] - left;

	    sum += Math.abs(val);
	  }

	  return sum;
	}

	function filterUp(pxData, pxPos, byteWidth, rawData, rawPos) {
	  for (let x = 0; x < byteWidth; x++) {
	    let up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
	    let val = pxData[pxPos + x] - up;

	    rawData[rawPos + x] = val;
	  }
	}

	function filterSumUp(pxData, pxPos, byteWidth) {
	  let sum = 0;
	  let length = pxPos + byteWidth;
	  for (let x = pxPos; x < length; x++) {
	    let up = pxPos > 0 ? pxData[x - byteWidth] : 0;
	    let val = pxData[x] - up;

	    sum += Math.abs(val);
	  }

	  return sum;
	}

	function filterAvg(pxData, pxPos, byteWidth, rawData, rawPos, bpp) {
	  for (let x = 0; x < byteWidth; x++) {
	    let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
	    let up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
	    let val = pxData[pxPos + x] - ((left + up) >> 1);

	    rawData[rawPos + x] = val;
	  }
	}

	function filterSumAvg(pxData, pxPos, byteWidth, bpp) {
	  let sum = 0;
	  for (let x = 0; x < byteWidth; x++) {
	    let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
	    let up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
	    let val = pxData[pxPos + x] - ((left + up) >> 1);

	    sum += Math.abs(val);
	  }

	  return sum;
	}

	function filterPaeth(pxData, pxPos, byteWidth, rawData, rawPos, bpp) {
	  for (let x = 0; x < byteWidth; x++) {
	    let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
	    let up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
	    let upleft =
	      pxPos > 0 && x >= bpp ? pxData[pxPos + x - (byteWidth + bpp)] : 0;
	    let val = pxData[pxPos + x] - paethPredictor(left, up, upleft);

	    rawData[rawPos + x] = val;
	  }
	}

	function filterSumPaeth(pxData, pxPos, byteWidth, bpp) {
	  let sum = 0;
	  for (let x = 0; x < byteWidth; x++) {
	    let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
	    let up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
	    let upleft =
	      pxPos > 0 && x >= bpp ? pxData[pxPos + x - (byteWidth + bpp)] : 0;
	    let val = pxData[pxPos + x] - paethPredictor(left, up, upleft);

	    sum += Math.abs(val);
	  }

	  return sum;
	}

	let filters = {
	  0: filterNone,
	  1: filterSub,
	  2: filterUp,
	  3: filterAvg,
	  4: filterPaeth,
	};

	let filterSums = {
	  0: filterSumNone,
	  1: filterSumSub,
	  2: filterSumUp,
	  3: filterSumAvg,
	  4: filterSumPaeth,
	};

	filterPack = function (pxData, width, height, options, bpp) {
	  let filterTypes;
	  if (!("filterType" in options) || options.filterType === -1) {
	    filterTypes = [0, 1, 2, 3, 4];
	  } else if (typeof options.filterType === "number") {
	    filterTypes = [options.filterType];
	  } else {
	    throw new Error("unrecognised filter types");
	  }

	  if (options.bitDepth === 16) {
	    bpp *= 2;
	  }
	  let byteWidth = width * bpp;
	  let rawPos = 0;
	  let pxPos = 0;
	  let rawData = Buffer.alloc((byteWidth + 1) * height);

	  let sel = filterTypes[0];

	  for (let y = 0; y < height; y++) {
	    if (filterTypes.length > 1) {
	      // find best filter for this line (with lowest sum of values)
	      let min = Infinity;

	      for (let i = 0; i < filterTypes.length; i++) {
	        let sum = filterSums[filterTypes[i]](pxData, pxPos, byteWidth, bpp);
	        if (sum < min) {
	          sel = filterTypes[i];
	          min = sum;
	        }
	      }
	    }

	    rawData[rawPos] = sel;
	    rawPos++;
	    filters[sel](pxData, pxPos, byteWidth, rawData, rawPos, bpp);
	    rawPos += byteWidth;
	    pxPos += byteWidth;
	  }
	  return rawData;
	};
	return filterPack;
}

var hasRequiredPacker;

function requirePacker () {
	if (hasRequiredPacker) return packer.exports;
	hasRequiredPacker = 1;

	let constants = requireConstants();
	let CrcStream = requireCrc();
	let bitPacker = requireBitpacker();
	let filter = requireFilterPack();
	let zlib = require$$0;

	let Packer = (packer.exports = function (options) {
	  this._options = options;

	  options.deflateChunkSize = options.deflateChunkSize || 32 * 1024;
	  options.deflateLevel =
	    options.deflateLevel != null ? options.deflateLevel : 9;
	  options.deflateStrategy =
	    options.deflateStrategy != null ? options.deflateStrategy : 3;
	  options.inputHasAlpha =
	    options.inputHasAlpha != null ? options.inputHasAlpha : true;
	  options.deflateFactory = options.deflateFactory || zlib.createDeflate;
	  options.bitDepth = options.bitDepth || 8;
	  // This is outputColorType
	  options.colorType =
	    typeof options.colorType === "number"
	      ? options.colorType
	      : constants.COLORTYPE_COLOR_ALPHA;
	  options.inputColorType =
	    typeof options.inputColorType === "number"
	      ? options.inputColorType
	      : constants.COLORTYPE_COLOR_ALPHA;

	  if (
	    [
	      constants.COLORTYPE_GRAYSCALE,
	      constants.COLORTYPE_COLOR,
	      constants.COLORTYPE_COLOR_ALPHA,
	      constants.COLORTYPE_ALPHA,
	    ].indexOf(options.colorType) === -1
	  ) {
	    throw new Error(
	      "option color type:" + options.colorType + " is not supported at present"
	    );
	  }
	  if (
	    [
	      constants.COLORTYPE_GRAYSCALE,
	      constants.COLORTYPE_COLOR,
	      constants.COLORTYPE_COLOR_ALPHA,
	      constants.COLORTYPE_ALPHA,
	    ].indexOf(options.inputColorType) === -1
	  ) {
	    throw new Error(
	      "option input color type:" +
	        options.inputColorType +
	        " is not supported at present"
	    );
	  }
	  if (options.bitDepth !== 8 && options.bitDepth !== 16) {
	    throw new Error(
	      "option bit depth:" + options.bitDepth + " is not supported at present"
	    );
	  }
	});

	Packer.prototype.getDeflateOptions = function () {
	  return {
	    chunkSize: this._options.deflateChunkSize,
	    level: this._options.deflateLevel,
	    strategy: this._options.deflateStrategy,
	  };
	};

	Packer.prototype.createDeflate = function () {
	  return this._options.deflateFactory(this.getDeflateOptions());
	};

	Packer.prototype.filterData = function (data, width, height) {
	  // convert to correct format for filtering (e.g. right bpp and bit depth)
	  let packedData = bitPacker(data, width, height, this._options);

	  // filter pixel data
	  let bpp = constants.COLORTYPE_TO_BPP_MAP[this._options.colorType];
	  let filteredData = filter(packedData, width, height, this._options, bpp);
	  return filteredData;
	};

	Packer.prototype._packChunk = function (type, data) {
	  let len = data ? data.length : 0;
	  let buf = Buffer.alloc(len + 12);

	  buf.writeUInt32BE(len, 0);
	  buf.writeUInt32BE(type, 4);

	  if (data) {
	    data.copy(buf, 8);
	  }

	  buf.writeInt32BE(
	    CrcStream.crc32(buf.slice(4, buf.length - 4)),
	    buf.length - 4
	  );
	  return buf;
	};

	Packer.prototype.packGAMA = function (gamma) {
	  let buf = Buffer.alloc(4);
	  buf.writeUInt32BE(Math.floor(gamma * constants.GAMMA_DIVISION), 0);
	  return this._packChunk(constants.TYPE_gAMA, buf);
	};

	Packer.prototype.packIHDR = function (width, height) {
	  let buf = Buffer.alloc(13);
	  buf.writeUInt32BE(width, 0);
	  buf.writeUInt32BE(height, 4);
	  buf[8] = this._options.bitDepth; // Bit depth
	  buf[9] = this._options.colorType; // colorType
	  buf[10] = 0; // compression
	  buf[11] = 0; // filter
	  buf[12] = 0; // interlace

	  return this._packChunk(constants.TYPE_IHDR, buf);
	};

	Packer.prototype.packIDAT = function (data) {
	  return this._packChunk(constants.TYPE_IDAT, data);
	};

	Packer.prototype.packIEND = function () {
	  return this._packChunk(constants.TYPE_IEND, null);
	};
	return packer.exports;
}

var hasRequiredPackerAsync;

function requirePackerAsync () {
	if (hasRequiredPackerAsync) return packerAsync.exports;
	hasRequiredPackerAsync = 1;

	let util = require$$0$3;
	let Stream = require$$1;
	let constants = requireConstants();
	let Packer = requirePacker();

	let PackerAsync = (packerAsync.exports = function (opt) {
	  Stream.call(this);

	  let options = opt || {};

	  this._packer = new Packer(options);
	  this._deflate = this._packer.createDeflate();

	  this.readable = true;
	});
	util.inherits(PackerAsync, Stream);

	PackerAsync.prototype.pack = function (data, width, height, gamma) {
	  // Signature
	  this.emit("data", Buffer.from(constants.PNG_SIGNATURE));
	  this.emit("data", this._packer.packIHDR(width, height));

	  if (gamma) {
	    this.emit("data", this._packer.packGAMA(gamma));
	  }

	  let filteredData = this._packer.filterData(data, width, height);

	  // compress it
	  this._deflate.on("error", this.emit.bind(this, "error"));

	  this._deflate.on(
	    "data",
	    function (compressedData) {
	      this.emit("data", this._packer.packIDAT(compressedData));
	    }.bind(this)
	  );

	  this._deflate.on(
	    "end",
	    function () {
	      this.emit("data", this._packer.packIEND());
	      this.emit("end");
	    }.bind(this)
	  );

	  this._deflate.end(filteredData);
	};
	return packerAsync.exports;
}

var pngSync = {};

var syncInflate = {exports: {}};

var hasRequiredSyncInflate;

function requireSyncInflate () {
	if (hasRequiredSyncInflate) return syncInflate.exports;
	hasRequiredSyncInflate = 1;
	(function (module, exports$1) {

		let assert = require$$0$4.ok;
		let zlib = require$$0;
		let util = require$$0$3;

		let kMaxLength = require$$0$1.kMaxLength;

		function Inflate(opts) {
		  if (!(this instanceof Inflate)) {
		    return new Inflate(opts);
		  }

		  if (opts && opts.chunkSize < zlib.Z_MIN_CHUNK) {
		    opts.chunkSize = zlib.Z_MIN_CHUNK;
		  }

		  zlib.Inflate.call(this, opts);

		  // Node 8 --> 9 compatibility check
		  this._offset = this._offset === undefined ? this._outOffset : this._offset;
		  this._buffer = this._buffer || this._outBuffer;

		  if (opts && opts.maxLength != null) {
		    this._maxLength = opts.maxLength;
		  }
		}

		function createInflate(opts) {
		  return new Inflate(opts);
		}

		function _close(engine, callback) {

		  // Caller may invoke .close after a zlib error (which will null _handle).
		  if (!engine._handle) {
		    return;
		  }

		  engine._handle.close();
		  engine._handle = null;
		}

		Inflate.prototype._processChunk = function (chunk, flushFlag, asyncCb) {
		  if (typeof asyncCb === "function") {
		    return zlib.Inflate._processChunk.call(this, chunk, flushFlag, asyncCb);
		  }

		  let self = this;

		  let availInBefore = chunk && chunk.length;
		  let availOutBefore = this._chunkSize - this._offset;
		  let leftToInflate = this._maxLength;
		  let inOff = 0;

		  let buffers = [];
		  let nread = 0;

		  let error;
		  this.on("error", function (err) {
		    error = err;
		  });

		  function handleChunk(availInAfter, availOutAfter) {
		    if (self._hadError) {
		      return;
		    }

		    let have = availOutBefore - availOutAfter;
		    assert(have >= 0, "have should not go down");

		    if (have > 0) {
		      let out = self._buffer.slice(self._offset, self._offset + have);
		      self._offset += have;

		      if (out.length > leftToInflate) {
		        out = out.slice(0, leftToInflate);
		      }

		      buffers.push(out);
		      nread += out.length;
		      leftToInflate -= out.length;

		      if (leftToInflate === 0) {
		        return false;
		      }
		    }

		    if (availOutAfter === 0 || self._offset >= self._chunkSize) {
		      availOutBefore = self._chunkSize;
		      self._offset = 0;
		      self._buffer = Buffer.allocUnsafe(self._chunkSize);
		    }

		    if (availOutAfter === 0) {
		      inOff += availInBefore - availInAfter;
		      availInBefore = availInAfter;

		      return true;
		    }

		    return false;
		  }

		  assert(this._handle, "zlib binding closed");
		  let res;
		  do {
		    res = this._handle.writeSync(
		      flushFlag,
		      chunk, // in
		      inOff, // in_off
		      availInBefore, // in_len
		      this._buffer, // out
		      this._offset, //out_off
		      availOutBefore
		    ); // out_len
		    // Node 8 --> 9 compatibility check
		    res = res || this._writeState;
		  } while (!this._hadError && handleChunk(res[0], res[1]));

		  if (this._hadError) {
		    throw error;
		  }

		  if (nread >= kMaxLength) {
		    _close(this);
		    throw new RangeError(
		      "Cannot create final Buffer. It would be larger than 0x" +
		        kMaxLength.toString(16) +
		        " bytes"
		    );
		  }

		  let buf = Buffer.concat(buffers, nread);
		  _close(this);

		  return buf;
		};

		util.inherits(Inflate, zlib.Inflate);

		function zlibBufferSync(engine, buffer) {
		  if (typeof buffer === "string") {
		    buffer = Buffer.from(buffer);
		  }
		  if (!(buffer instanceof Buffer)) {
		    throw new TypeError("Not a string or buffer");
		  }

		  let flushFlag = engine._finishFlushFlag;
		  if (flushFlag == null) {
		    flushFlag = zlib.Z_FINISH;
		  }

		  return engine._processChunk(buffer, flushFlag);
		}

		function inflateSync(buffer, opts) {
		  return zlibBufferSync(new Inflate(opts), buffer);
		}

		module.exports = exports$1 = inflateSync;
		exports$1.Inflate = Inflate;
		exports$1.createInflate = createInflate;
		exports$1.inflateSync = inflateSync; 
	} (syncInflate, syncInflate.exports));
	return syncInflate.exports;
}

var syncReader = {exports: {}};

var hasRequiredSyncReader;

function requireSyncReader () {
	if (hasRequiredSyncReader) return syncReader.exports;
	hasRequiredSyncReader = 1;

	let SyncReader = (syncReader.exports = function (buffer) {
	  this._buffer = buffer;
	  this._reads = [];
	});

	SyncReader.prototype.read = function (length, callback) {
	  this._reads.push({
	    length: Math.abs(length), // if length < 0 then at most this length
	    allowLess: length < 0,
	    func: callback,
	  });
	};

	SyncReader.prototype.process = function () {
	  // as long as there is any data and read requests
	  while (this._reads.length > 0 && this._buffer.length) {
	    let read = this._reads[0];

	    if (
	      this._buffer.length &&
	      (this._buffer.length >= read.length || read.allowLess)
	    ) {
	      // ok there is any data so that we can satisfy this request
	      this._reads.shift(); // == read

	      let buf = this._buffer;

	      this._buffer = buf.slice(read.length);

	      read.func.call(this, buf.slice(0, read.length));
	    } else {
	      break;
	    }
	  }

	  if (this._reads.length > 0) {
	    throw new Error("There are some read requests waitng on finished stream");
	  }

	  if (this._buffer.length > 0) {
	    throw new Error("unrecognised content at end of stream");
	  }
	};
	return syncReader.exports;
}

var filterParseSync = {};

var hasRequiredFilterParseSync;

function requireFilterParseSync () {
	if (hasRequiredFilterParseSync) return filterParseSync;
	hasRequiredFilterParseSync = 1;

	let SyncReader = requireSyncReader();
	let Filter = requireFilterParse();

	filterParseSync.process = function (inBuffer, bitmapInfo) {
	  let outBuffers = [];
	  let reader = new SyncReader(inBuffer);
	  let filter = new Filter(bitmapInfo, {
	    read: reader.read.bind(reader),
	    write: function (bufferPart) {
	      outBuffers.push(bufferPart);
	    },
	    complete: function () {},
	  });

	  filter.start();
	  reader.process();

	  return Buffer.concat(outBuffers);
	};
	return filterParseSync;
}

var parserSync;
var hasRequiredParserSync;

function requireParserSync () {
	if (hasRequiredParserSync) return parserSync;
	hasRequiredParserSync = 1;

	let hasSyncZlib = true;
	let zlib = require$$0;
	let inflateSync = requireSyncInflate();
	if (!zlib.deflateSync) {
	  hasSyncZlib = false;
	}
	let SyncReader = requireSyncReader();
	let FilterSync = requireFilterParseSync();
	let Parser = requireParser();
	let bitmapper = requireBitmapper();
	let formatNormaliser = requireFormatNormaliser();

	parserSync = function (buffer, options) {
	  if (!hasSyncZlib) {
	    throw new Error(
	      "To use the sync capability of this library in old node versions, please pin pngjs to v2.3.0"
	    );
	  }

	  let err;
	  function handleError(_err_) {
	    err = _err_;
	  }

	  let metaData;
	  function handleMetaData(_metaData_) {
	    metaData = _metaData_;
	  }

	  function handleTransColor(transColor) {
	    metaData.transColor = transColor;
	  }

	  function handlePalette(palette) {
	    metaData.palette = palette;
	  }

	  function handleSimpleTransparency() {
	    metaData.alpha = true;
	  }

	  let gamma;
	  function handleGamma(_gamma_) {
	    gamma = _gamma_;
	  }

	  let inflateDataList = [];
	  function handleInflateData(inflatedData) {
	    inflateDataList.push(inflatedData);
	  }

	  let reader = new SyncReader(buffer);

	  let parser = new Parser(options, {
	    read: reader.read.bind(reader),
	    error: handleError,
	    metadata: handleMetaData,
	    gamma: handleGamma,
	    palette: handlePalette,
	    transColor: handleTransColor,
	    inflateData: handleInflateData,
	    simpleTransparency: handleSimpleTransparency,
	  });

	  parser.start();
	  reader.process();

	  if (err) {
	    throw err;
	  }

	  //join together the inflate datas
	  let inflateData = Buffer.concat(inflateDataList);
	  inflateDataList.length = 0;

	  let inflatedData;
	  if (metaData.interlace) {
	    inflatedData = zlib.inflateSync(inflateData);
	  } else {
	    let rowSize =
	      ((metaData.width * metaData.bpp * metaData.depth + 7) >> 3) + 1;
	    let imageSize = rowSize * metaData.height;
	    inflatedData = inflateSync(inflateData, {
	      chunkSize: imageSize,
	      maxLength: imageSize,
	    });
	  }
	  inflateData = null;

	  if (!inflatedData || !inflatedData.length) {
	    throw new Error("bad png - invalid inflate data response");
	  }

	  let unfilteredData = FilterSync.process(inflatedData, metaData);
	  inflateData = null;

	  let bitmapData = bitmapper.dataToBitMap(unfilteredData, metaData);
	  unfilteredData = null;

	  let normalisedBitmapData = formatNormaliser(
	    bitmapData,
	    metaData,
	    options.skipRescale
	  );

	  metaData.data = normalisedBitmapData;
	  metaData.gamma = gamma || 0;

	  return metaData;
	};
	return parserSync;
}

var packerSync;
var hasRequiredPackerSync;

function requirePackerSync () {
	if (hasRequiredPackerSync) return packerSync;
	hasRequiredPackerSync = 1;

	let hasSyncZlib = true;
	let zlib = require$$0;
	if (!zlib.deflateSync) {
	  hasSyncZlib = false;
	}
	let constants = requireConstants();
	let Packer = requirePacker();

	packerSync = function (metaData, opt) {
	  if (!hasSyncZlib) {
	    throw new Error(
	      "To use the sync capability of this library in old node versions, please pin pngjs to v2.3.0"
	    );
	  }

	  let options = opt || {};

	  let packer = new Packer(options);

	  let chunks = [];

	  // Signature
	  chunks.push(Buffer.from(constants.PNG_SIGNATURE));

	  // Header
	  chunks.push(packer.packIHDR(metaData.width, metaData.height));

	  if (metaData.gamma) {
	    chunks.push(packer.packGAMA(metaData.gamma));
	  }

	  let filteredData = packer.filterData(
	    metaData.data,
	    metaData.width,
	    metaData.height
	  );

	  // compress it
	  let compressedData = zlib.deflateSync(
	    filteredData,
	    packer.getDeflateOptions()
	  );
	  filteredData = null;

	  if (!compressedData || !compressedData.length) {
	    throw new Error("bad png - invalid compressed data response");
	  }
	  chunks.push(packer.packIDAT(compressedData));

	  // End
	  chunks.push(packer.packIEND());

	  return Buffer.concat(chunks);
	};
	return packerSync;
}

var hasRequiredPngSync;

function requirePngSync () {
	if (hasRequiredPngSync) return pngSync;
	hasRequiredPngSync = 1;

	let parse = requireParserSync();
	let pack = requirePackerSync();

	pngSync.read = function (buffer, options) {
	  return parse(buffer, options || {});
	};

	pngSync.write = function (png, options) {
	  return pack(png, options);
	};
	return pngSync;
}

var hasRequiredPng;

function requirePng () {
	if (hasRequiredPng) return png;
	hasRequiredPng = 1;

	let util = require$$0$3;
	let Stream = require$$1;
	let Parser = requireParserAsync();
	let Packer = requirePackerAsync();
	let PNGSync = requirePngSync();

	let PNG = (png.PNG = function (options) {
	  Stream.call(this);

	  options = options || {}; // eslint-disable-line no-param-reassign

	  // coerce pixel dimensions to integers (also coerces undefined -> 0):
	  this.width = options.width | 0;
	  this.height = options.height | 0;

	  this.data =
	    this.width > 0 && this.height > 0
	      ? Buffer.alloc(4 * this.width * this.height)
	      : null;

	  if (options.fill && this.data) {
	    this.data.fill(0);
	  }

	  this.gamma = 0;
	  this.readable = this.writable = true;

	  this._parser = new Parser(options);

	  this._parser.on("error", this.emit.bind(this, "error"));
	  this._parser.on("close", this._handleClose.bind(this));
	  this._parser.on("metadata", this._metadata.bind(this));
	  this._parser.on("gamma", this._gamma.bind(this));
	  this._parser.on(
	    "parsed",
	    function (data) {
	      this.data = data;
	      this.emit("parsed", data);
	    }.bind(this)
	  );

	  this._packer = new Packer(options);
	  this._packer.on("data", this.emit.bind(this, "data"));
	  this._packer.on("end", this.emit.bind(this, "end"));
	  this._parser.on("close", this._handleClose.bind(this));
	  this._packer.on("error", this.emit.bind(this, "error"));
	});
	util.inherits(PNG, Stream);

	PNG.sync = PNGSync;

	PNG.prototype.pack = function () {
	  if (!this.data || !this.data.length) {
	    this.emit("error", "No data provided");
	    return this;
	  }

	  process.nextTick(
	    function () {
	      this._packer.pack(this.data, this.width, this.height, this.gamma);
	    }.bind(this)
	  );

	  return this;
	};

	PNG.prototype.parse = function (data, callback) {
	  if (callback) {
	    let onParsed, onError;

	    onParsed = function (parsedData) {
	      this.removeListener("error", onError);

	      this.data = parsedData;
	      callback(null, this);
	    }.bind(this);

	    onError = function (err) {
	      this.removeListener("parsed", onParsed);

	      callback(err, null);
	    }.bind(this);

	    this.once("parsed", onParsed);
	    this.once("error", onError);
	  }

	  this.end(data);
	  return this;
	};

	PNG.prototype.write = function (data) {
	  this._parser.write(data);
	  return true;
	};

	PNG.prototype.end = function (data) {
	  this._parser.end(data);
	};

	PNG.prototype._metadata = function (metadata) {
	  this.width = metadata.width;
	  this.height = metadata.height;

	  this.emit("metadata", metadata);
	};

	PNG.prototype._gamma = function (gamma) {
	  this.gamma = gamma;
	};

	PNG.prototype._handleClose = function () {
	  if (!this._parser.writable && !this._packer.readable) {
	    this.emit("close");
	  }
	};

	PNG.bitblt = function (src, dst, srcX, srcY, width, height, deltaX, deltaY) {
	  // eslint-disable-line max-params
	  // coerce pixel dimensions to integers (also coerces undefined -> 0):
	  /* eslint-disable no-param-reassign */
	  srcX |= 0;
	  srcY |= 0;
	  width |= 0;
	  height |= 0;
	  deltaX |= 0;
	  deltaY |= 0;
	  /* eslint-enable no-param-reassign */

	  if (
	    srcX > src.width ||
	    srcY > src.height ||
	    srcX + width > src.width ||
	    srcY + height > src.height
	  ) {
	    throw new Error("bitblt reading outside image");
	  }

	  if (
	    deltaX > dst.width ||
	    deltaY > dst.height ||
	    deltaX + width > dst.width ||
	    deltaY + height > dst.height
	  ) {
	    throw new Error("bitblt writing outside image");
	  }

	  for (let y = 0; y < height; y++) {
	    src.data.copy(
	      dst.data,
	      ((deltaY + y) * dst.width + deltaX) << 2,
	      ((srcY + y) * src.width + srcX) << 2,
	      ((srcY + y) * src.width + srcX + width) << 2
	    );
	  }
	};

	PNG.prototype.bitblt = function (
	  dst,
	  srcX,
	  srcY,
	  width,
	  height,
	  deltaX,
	  deltaY
	) {
	  // eslint-disable-line max-params

	  PNG.bitblt(this, dst, srcX, srcY, width, height, deltaX, deltaY);
	  return this;
	};

	PNG.adjustGamma = function (src) {
	  if (src.gamma) {
	    for (let y = 0; y < src.height; y++) {
	      for (let x = 0; x < src.width; x++) {
	        let idx = (src.width * y + x) << 2;

	        for (let i = 0; i < 3; i++) {
	          let sample = src.data[idx + i] / 255;
	          sample = Math.pow(sample, 1 / 2.2 / src.gamma);
	          src.data[idx + i] = Math.round(sample * 255);
	        }
	      }
	    }
	    src.gamma = 0;
	  }
	};

	PNG.prototype.adjustGamma = function () {
	  PNG.adjustGamma(this);
	};
	return png;
}

var pngExports = requirePng();

/**
 * GIF frame cache
 */
const gifFrameCache = new Map();
/**
 * Random Image Display action
 */
let RandomImageAction = (() => {
    let _classDecorators = [action({ UUID: "com.darkside1305.random-image-display.random-image" })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = SingletonAction;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        gifStates = new Map();
        async onDidReceiveSettings(ev) {
            console.log('[ACTION] Settings received');
        }
        async onWillAppear(ev) {
            console.log('[ACTION] onWillAppear called');
            const settings = ev.payload.settings;
            if (!settings.images) {
                await ev.action.setSettings({
                    images: [],
                    gifSettings: {},
                    allowRepeats: true,
                    playGifsOnLoad: true,
                    lastImageIndex: -1
                });
                await ev.action.setImage("imgs/actions/random/random-icon-white.png");
                return;
            }
            if (settings.allowRepeats === undefined)
                settings.allowRepeats = true;
            if (settings.playGifsOnLoad === undefined)
                settings.playGifsOnLoad = true;
            if (!settings.gifSettings)
                settings.gifSettings = {};
            // Show the last displayed image (or default icon if none)
            if (settings.images.length > 0 && settings.lastImageIndex !== undefined && settings.lastImageIndex >= 0) {
                const lastImagePath = settings.images[settings.lastImageIndex];
                // Check if it's a GIF
                if (this.isGif(lastImagePath)) {
                    // Only play GIF if playGifsOnLoad is enabled
                    if (settings.playGifsOnLoad !== false) {
                        const loop = settings.gifSettings?.[lastImagePath]?.loop !== false;
                        await this.playGif(ev.action, lastImagePath, loop);
                    }
                    else {
                        // Just show the first frame (static)
                        await ev.action.setImage(lastImagePath);
                    }
                }
                else {
                    await ev.action.setImage(lastImagePath);
                }
            }
            else {
                await ev.action.setImage("imgs/actions/random/random-icon-white.png");
            }
        }
        async onWillDisappear(ev) {
            this.stopAllGifAnimations(ev.action.id);
        }
        async onKeyDown(ev) {
            const settings = ev.payload.settings;
            if (!settings.images || settings.images.length === 0) {
                await ev.action.setImage("imgs/actions/random/random-icon-white.png");
                return;
            }
            await this.showRandomImage(ev.action, settings);
        }
        async showRandomImage(action, settings) {
            const images = settings.images;
            const allowRepeats = settings.allowRepeats !== false;
            const lastIndex = settings.lastImageIndex ?? -1;
            let randomIndex;
            if (images.length === 1) {
                randomIndex = 0;
            }
            else if (!allowRepeats && images.length > 1) {
                do {
                    randomIndex = Math.floor(Math.random() * images.length);
                } while (randomIndex === lastIndex);
            }
            else {
                randomIndex = Math.floor(Math.random() * images.length);
            }
            const imagePath = images[randomIndex];
            this.stopAllGifAnimations(action.id);
            if (this.isGif(imagePath)) {
                const loop = settings.gifSettings?.[imagePath]?.loop !== false;
                await this.playGif(action, imagePath, loop);
            }
            else {
                await action.setImage(imagePath);
            }
            await action.setSettings({
                ...settings,
                lastImageIndex: randomIndex
            });
        }
        isGif(filePath) {
            return filePath.toLowerCase().endsWith('.gif');
        }
        /**
         * Validate that a frame has actual content (not all transparent/black)
         */
        isValidFrame(pixels) {
            let hasColor = false;
            for (let i = 0; i < pixels.length; i += 4) {
                const a = pixels[i + 3];
                if (a > 0) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    if (r > 0 || g > 0 || b > 0) {
                        hasColor = true;
                        break;
                    }
                }
            }
            return hasColor;
        }
        async playGif(action, gifPath, loop) {
            try {
                console.log('[ACTION] Loading GIF:', gifPath);
                let cachedData = gifFrameCache.get(gifPath);
                if (!cachedData) {
                    console.log('[ACTION] Decoding GIF with omggif...');
                    const gifData = readFileSync$1(gifPath);
                    const reader = new omggifExports.GifReader(gifData);
                    const width = reader.width;
                    const height = reader.height;
                    const numFrames = reader.numFrames();
                    console.log('[ACTION] GIF:', width, 'x', height, numFrames, 'frames');
                    const frames = [];
                    const delays = [];
                    // Keep canvas for compositing
                    const pixels = new Uint8ClampedArray(width * height * 4);
                    const previousPixels = new Uint8ClampedArray(width * height * 4);
                    let lastValidFrame = null;
                    // Initialize to transparent
                    pixels.fill(0);
                    for (let i = 0; i < numFrames; i++) {
                        try {
                            const frameInfo = reader.frameInfo(i);
                            console.log(`[ACTION] Frame ${i}: x=${frameInfo.x}, y=${frameInfo.y}, w=${frameInfo.width}, h=${frameInfo.height}, disposal=${frameInfo.disposal}`);
                            // Handle disposal from previous frame
                            if (i > 0) {
                                const prevFrameInfo = reader.frameInfo(i - 1);
                                if (prevFrameInfo.disposal === 2) {
                                    // Clear ONLY the previous frame's area to transparent
                                    const px = prevFrameInfo.x;
                                    const py = prevFrameInfo.y;
                                    const pw = prevFrameInfo.width;
                                    const ph = prevFrameInfo.height;
                                    for (let y = py; y < py + ph && y < height; y++) {
                                        for (let x = px; x < px + pw && x < width; x++) {
                                            const idx = (y * width + x) * 4;
                                            pixels[idx] = 0;
                                            pixels[idx + 1] = 0;
                                            pixels[idx + 2] = 0;
                                            pixels[idx + 3] = 0;
                                        }
                                    }
                                }
                                else if (prevFrameInfo.disposal === 3) {
                                    // Restore previous
                                    for (let j = 0; j < pixels.length; j++) {
                                        pixels[j] = previousPixels[j];
                                    }
                                }
                                // For disposal 0 or 1, keep pixels as-is
                            }
                            // Backup before blitting
                            for (let j = 0; j < pixels.length; j++) {
                                previousPixels[j] = pixels[j];
                            }
                            // Decode frame - this only updates the frame's region
                            reader.decodeAndBlitFrameRGBA(i, pixels);
                            // Validate frame
                            if (!this.isValidFrame(pixels) && lastValidFrame) {
                                console.log(`[ACTION] Frame ${i} invalid, reusing last valid frame`);
                                frames.push(lastValidFrame);
                                delays.push(frameInfo.delay * 10 || 100);
                                continue;
                            }
                            // Convert to PNG
                            const png = new pngExports.PNG({ width, height });
                            for (let j = 0; j < pixels.length; j++) {
                                png.data[j] = pixels[j];
                            }
                            const pngBuffer = pngExports.PNG.sync.write(png);
                            const pngBase64 = `data:image/png;base64,${pngBuffer.toString('base64')}`;
                            frames.push(pngBase64);
                            lastValidFrame = pngBase64;
                            delays.push(frameInfo.delay * 10 || 100);
                        }
                        catch (error) {
                            console.error(`[ACTION] Error on frame ${i}:`, error);
                            if (lastValidFrame) {
                                frames.push(lastValidFrame);
                                delays.push(100);
                            }
                        }
                    }
                    cachedData = { frames, delays };
                    gifFrameCache.set(gifPath, cachedData);
                    console.log('[ACTION] GIF cached:', frames.length, 'frames');
                }
                else {
                    console.log('[ACTION] Using cached GIF');
                }
                const gifState = {
                    frames: cachedData.frames,
                    delays: cachedData.delays,
                    currentFrame: 0,
                    loop
                };
                this.gifStates.set(action.id, gifState);
                this.animateGif(action, gifState);
            }
            catch (error) {
                console.error('[ACTION] Error loading GIF:', error);
                await action.setImage(gifPath);
            }
        }
        animateGif(action, gifState) {
            const showNextFrame = async () => {
                if (!this.gifStates.has(action.id))
                    return;
                const frame = gifState.frames[gifState.currentFrame];
                await action.setImage(frame);
                const delay = gifState.delays[gifState.currentFrame];
                gifState.currentFrame++;
                if (gifState.currentFrame >= gifState.frames.length) {
                    if (gifState.loop) {
                        gifState.currentFrame = 0;
                    }
                    else {
                        console.log('[ACTION] GIF complete');
                        return;
                    }
                }
                gifState.interval = setTimeout(showNextFrame, delay);
            };
            // Add a small initial delay (300ms) so user can lift their finger
            setTimeout(showNextFrame, 300);
        }
        stopAllGifAnimations(actionId) {
            const gifState = this.gifStates.get(actionId);
            if (gifState?.interval) {
                clearTimeout(gifState.interval);
            }
            this.gifStates.delete(actionId);
        }
    });
    return _classThis;
})();

console.log('[PLUGIN] Plugin starting...');
// Register the action
streamDeck.actions.registerAction(new RandomImageAction());
console.log('[PLUGIN] Action registered');
// Connect to Stream Deck
streamDeck.connect();
console.log('[PLUGIN] Connected to Stream Deck');
//# sourceMappingURL=plugin.js.map
