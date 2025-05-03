"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WRAPPING_KEY_SIZE = exports.ENCODING_STRATEGY = exports.CryptographyService = void 0;
var _clientNode = require("@aws-crypto/client-node");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
const ENCODING_STRATEGY = exports.ENCODING_STRATEGY = 'base64';
const WRAPPING_KEY_SIZE = exports.WRAPPING_KEY_SIZE = 32;
class CryptographyService {
  constructor(logger) {
    this.logger = logger;
    // commitment policy to enable data key derivation and ECDSA signature
    _defineProperty(this, "commitmentPolicy", _clientNode.CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT);
    // algorithm suite identifier to adopt AES-GCM
    _defineProperty(this, "wrappingSuite", _clientNode.RawAesWrappingSuiteIdentifier.AES256_GCM_IV12_TAG16_NO_PADDING);
  }
  setup(config) {
    // Fetch configs used to create credential saved objects client wrapper
    const {
      wrappingKeyName,
      wrappingKeyNamespace,
      wrappingKey
    } = config.encryption;
    if (wrappingKey.length !== WRAPPING_KEY_SIZE) {
      const wrappingKeySizeMismatchMsg = `Wrapping key size should be 32 bytes, as used in envelope encryption. Current wrapping key size: '${wrappingKey.length}' bytes`;
      this.logger.error(wrappingKeySizeMismatchMsg);
      throw new Error(wrappingKeySizeMismatchMsg);
    }

    // Create raw AES keyring
    const keyring = new _clientNode.RawAesKeyringNode({
      keyName: wrappingKeyName,
      keyNamespace: wrappingKeyNamespace,
      unencryptedMasterKey: new Uint8Array(wrappingKey),
      wrappingSuite: this.wrappingSuite
    });

    // Destructuring encrypt and decrypt functions from client
    const {
      encrypt,
      decrypt
    } = (0, _clientNode.buildClient)(this.commitmentPolicy);
    const encryptAndEncode = async (plainText, encryptionContext = {}) => {
      const result = await encrypt(keyring, plainText, {
        encryptionContext
      });
      return result.result.toString(ENCODING_STRATEGY);
    };
    const decodeAndDecrypt = async encrypted => {
      const {
        plaintext,
        messageHeader
      } = await decrypt(keyring, Buffer.from(encrypted, ENCODING_STRATEGY));
      return {
        decryptedText: plaintext.toString(),
        encryptionContext: {
          endpoint: messageHeader.encryptionContext.endpoint
        }
      };
    };
    return {
      encryptAndEncode,
      decodeAndDecrypt
    };
  }
  start() {}
  stop() {}
}
exports.CryptographyService = CryptographyService;