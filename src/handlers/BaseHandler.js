import PluginManager from '@plugin/PluginManager'

import EventEmitter from 'events'


export default class BaseHandler {

    constructor(id, users, db, config) {
        if (!id || !users || !db || !config) {
            throw new Error('BaseHandler requires id, users, db, and config parameters')
        }

        this.id = id
        this.users = users
        this.db = db
        this.config = config

        this.logging = true

        this.plugins = null

        this.events = new EventEmitter({ captureRejections: true })

        // Common swear words to filter - using Set for O(1) lookup
        this.swearWords = new Set([
            // Common profanity
            'fuck', 'shit', 'bitch', 'ass', 'damn', 'hell',
            // Variations and common misspellings
            'fck', 'fuk', 'fux', 'sh*t', 'b*tch', 'b!tch', 'a$$', 'd@mn',
            // Common gaming insults
            'noob', 'nub', 'n00b', 'retard', 'ret@rd',
            // Racial slurs and hate speech
            'nigger', 'n1gger', 'n1gg3r', 'faggot', 'f@g', 'f@gg0t',
            // Common leetspeak variations
            'f4ck', 'sh1t', 'b1tch', '@ss', 'd@mn'
        ])

        this.events.on('error', (error) => {
            this.error(error)
        })
    }

    startPlugins(pluginsDir = '') {
        try {
            this.plugins = new PluginManager(this, pluginsDir)
        } catch (error) {
            this.error(new Error(`Failed to start plugins: ${error.message}`))
        }
    }

    containsSwearWords(message) {
        try {
            if (!message || typeof message !== 'string') return false
            
            // Convert to lowercase once
            const lowerMessage = message.toLowerCase()
            
            // Check each word in the message
            const words = lowerMessage.split(/\s+/)
            return words.some(word => this.swearWords.has(word))
        } catch (error) {
            this.error(new Error(`Error checking swear words: ${error.message}`))
            return false // Fail safe - don't block message if check fails
        }
    }

    logChatMessage(user, message, containsSwear) {
        try {
            if (!user || !message) {
                this.error(new Error('Invalid parameters for logChatMessage'))
                return null
            }
            
            const timestamp = new Date().toISOString()
            const logEntry = {
                timestamp,
                userId: user.id || 'unknown',
                username: user.username || 'unknown',
                message: message.substring(0, 500), // Limit message length
                containsSwear,
                ip: user.address || 'unknown'
            }
            
            // Log to console with appropriate formatting
            console.log(`[${this.id}] [CHAT] ${timestamp} - User: ${logEntry.username} (${logEntry.userId}) - Message: ${logEntry.message}${containsSwear ? ' (BLOCKED - Contains inappropriate content)' : ''}`)
            
            return logEntry
        } catch (error) {
            this.error(new Error(`Error logging chat message: ${error.message}`))
            return null
        }
    }

    handle(message, user) {
        try {
            // Input validation
            if (!message || typeof message !== 'object') {
                this.error(new Error('Invalid message format: message must be an object'))
                return
            }

            if (!message.action || typeof message.action !== 'string') {
                this.error(new Error('Invalid message format: message.action must be a string'))
                return
            }

            if (!user) {
                this.error(new Error('Invalid user: user parameter is required'))
                return
            }

            // Log received message if logging is enabled
            if (this.logging) {
                console.log(`[${this.id}] Received: ${message.action} ${JSON.stringify(message.args || [])}`)
            }

            // Check guard conditions
            if (this.handleGuard(message, user)) {
                return user.close()
            }

            // Handle chat messages specifically
            if (message.action === 'chat_message') {
                const chatMessage = message.args?.[0]
                if (!chatMessage || typeof chatMessage !== 'string') {
                    this.error(new Error('Invalid chat message format: message must be a string'))
                    return
                }

                // Check message length
                if (chatMessage.length > 500) {
                    this.error(new Error('Chat message too long'))
                    return
                }

                const containsSwear = this.containsSwearWords(chatMessage)
                
                // Log the chat message
                this.logChatMessage(user, chatMessage, containsSwear)
                
                // If message contains swear words, don't emit the event and notify user
                if (containsSwear) {
                    if (user.socket && typeof user.socket.emit === 'function') {
                        user.socket.emit('chat_error', { 
                            message: 'Your message contains inappropriate content and has been blocked.' 
                        })
                    }
                    return
                }
            }

            // Emit events safely
            try {
                this.events.emit(message.action, message.args || [], user)

                if (user.events && typeof user.events.emit === 'function') {
                    user.events.emit(message.action, message.args || [], user)
                }
            } catch (eventError) {
                this.error(new Error(`Error emitting events: ${eventError.message}`))
            }

        } catch(error) {
            this.error(error)
        }
    }

    handleGuard(message, user) {
        try {
            return false
        } catch (error) {
            this.error(new Error(`Error in handleGuard: ${error.message}`))
            return false // Fail safe - don't block user if guard check fails
        }
    }

    close(user) {
        try {
            if (!user || !user.socket || !user.socket.id) {
                this.error(new Error('Invalid user or socket for closing'))
                return
            }
            delete this.users[user.socket.id]
        } catch (error) {
            this.error(new Error(`Error closing user: ${error.message}`))
        }
    }

    error(error) {
        try {
            if (!error) return
            
            const errorMessage = error instanceof Error ? error.stack : error
            console.error(`[${this.id}] ERROR: ${errorMessage}`)
        } catch (e) {
            // If error logging fails, at least try to log something
            console.error(`[${this.id}] CRITICAL ERROR: Failed to log error`)
        }
    }

}
