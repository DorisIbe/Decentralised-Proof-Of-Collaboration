;; Proof of Collaboration Protocol
;; Written in Clarity for Stacks blockchain

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-verified (err u102))

;; Define contribution tiers
(define-constant BRONZE u1)
(define-constant SILVER u2)
(define-constant GOLD u3)
(define-constant PLATINUM u4)

;; Define tier thresholds
(define-constant SILVER-THRESHOLD u100)
(define-constant GOLD-THRESHOLD u250)
(define-constant PLATINUM-THRESHOLD u500)