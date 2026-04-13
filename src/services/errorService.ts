let _failOnNextCall = false

export function forceNextError(): void {
  _failOnNextCall = true
}

export function cancelForcedError(): void {
  _failOnNextCall = false
}

export function maybeFail(): void {
  if (_failOnNextCall) {
    _failOnNextCall = false
    throw new Error('Error simulado (forzado manualmente).')
  }
}