// // read number of pins
// console.log(`num pins: ${modules.gpio1.numPins()}`)

// // read digital state of pin 0
// console.log(`pin 0: ${modules.gpio1.digitalRead(0)}`)

// // configure pin 0 as input with pull-up
// modules.gpio1.configure(0, jacdac.GPIOMode.InputPullUp)

// // digital write pin 1 high
// modules.gpio1.digitalWrite(1, true)

// // digital write pin 1 low
// modules.gpio1.digitalWrite(1, false)

// // request pin info
// modules.gpio1.requestPinInfo(0)

// // listen for state changes
// modules.gpio1.onDigitalStateChanged(() => {
//     console.log(`pin 0 changed: ${modules.gpio1.digitalRead(0)}`)
// })
