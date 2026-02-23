namespace modules {
    /**
     * Access to General Purpose Input/Output (GPIO) pins on a board.
     * The pins are indexed `0 ... num_pins-1`.
     * The indexing does not correspond to hardware pin names, nor labels on the board,
     * and should not be exposed to the user.
     **/
    //% fixedInstances blockGap=8
    export class GPIOClient extends jacdac.SensorClient {
        private readonly _numPins: jacdac.RegisterClient<[number]>

        constructor(role: string) {
            super(jacdac.SRV_GPIO, role, jacdac.GPIORegPack.State)

            this._numPins = this.addRegister<[number]>(
                jacdac.GPIOReg.NumPins,
                jacdac.GPIORegPack.NumPins,
                jacdac.RegisterClientFlags.Const
            )
        }

        /**
         * For every pin set to `Input*` the corresponding bit in the returned buffer
         * will be `1` if and only if the pin is high. For other pins, the bit is `0`.
         * This is normally streamed at low-ish speed, but it's also automatically reported whenever
         * a digital input pin changes value (throttled to ~100Hz).
         */
        //% callInDebugger
        //% group="GPIO"
        //% weight=100
        state(): Buffer {
            this.setStreaming(true)
            const values = this._reading.pauseUntilValues(
                this.readingTimeout
            ) as any[]
            return values[0]
        }

        /**
         * Reads the digital value of a specific pin from the latest streamed state.
         * Returns `true` if the pin is high, `false` if low or not configured as input.
         */
        //% group="GPIO"
        //% block="%gpio digital read pin %pin"
        //% blockId=jacdac_gpio_digital_read
        //% weight=99
        //% pin.min=0
        //% pin.defl=0
        digitalRead(pin: number): boolean {
            const buf = this.state()
            if (!buf || pin < 0) return false
            const byteIndex = pin >> 3
            if (byteIndex >= buf.length) return false
            const bitIndex = pin % 8
            return ((buf[byteIndex] >> bitIndex) & 1) === 1
        }

        /**
         * Number of pins that can be operated through this service.
         */
        //% callInDebugger
        //% group="GPIO"
        //% block="%gpio number of pins"
        //% blockId=jacdac_gpio_num_pins
        //% weight=98
        numPins(): number {
            this.start()
            const values = this._numPins.pauseUntilValues() as any[]
            return values[0]
        }

        /**
         * Configure a pin's mode.
         * `Alternative` setting means the pin is controlled by other service (SPI, I2C, UART, PWM, etc.).
         */
        //% group="GPIO"
        //% block="%gpio configure pin %pin to %mode"
        //% blockId=jacdac_gpio_configure
        //% weight=97
        //% pin.min=0
        //% pin.defl=0
        configure(pin: number, mode: jacdac.GPIOMode): void {
            this.start()
            // ensure device is connected before sending
            this._numPins.pauseUntilValues()
            const buf = control.createBuffer(2)
            buf[0] = pin
            buf[1] = mode
            this.sendCommand(
                jacdac.JDPacket.from(jacdac.GPIOCmd.Configure, buf)
            )
        }

        /**
         * Set a pin to digital output with the given value.
         * Sets the pin mode to ``OutputHigh`` or ``OutputLow``.
         */
        //% group="GPIO"
        //% block="%gpio digital write pin %pin to %high"
        //% blockId=jacdac_gpio_digital_write
        //% weight=96
        //% pin.min=0
        //% pin.defl=0
        digitalWrite(pin: number, high: boolean): void {
            this.configure(
                pin,
                high
                    ? jacdac.GPIOMode.OutputHigh
                    : jacdac.GPIOMode.OutputLow
            )
        }

        /**
         * Request information about a pin by its index.
         * Sends the ``pin_info`` command; the response is handled asynchronously.
         */
        //% group="GPIO"
        //% block="%gpio request pin info %pin"
        //% blockId=jacdac_gpio_pin_info
        //% weight=94
        //% pin.min=0
        //% pin.defl=0
        requestPinInfo(pin: number): void {
            this.start()
            this._numPins.pauseUntilValues()
            const buf = control.createBuffer(1)
            buf[0] = pin
            this.sendCommand(
                jacdac.JDPacket.from(jacdac.GPIOCmd.PinInfo, buf)
            )
        }

        /**
         * Request information about a pin by its label.
         * Sends the ``pin_by_label`` command; the response is handled asynchronously.
         */
        //% group="GPIO"
        //% weight=93
        requestPinByLabel(label: string): void {
            this.start()
            this._numPins.pauseUntilValues()
            this.sendCommand(
                jacdac.JDPacket.jdpacked(
                    jacdac.GPIOCmd.PinByLabel,
                    jacdac.GPIOCmdPack.PinByLabel,
                    [label]
                )
            )
        }

        /**
         * Request information about a pin by its hardware pin number.
         * Sends the ``pin_by_hw_pin`` command; the response is handled asynchronously.
         */
        //% group="GPIO"
        //% weight=92
        requestPinByHwPin(hwPin: number): void {
            this.start()
            this._numPins.pauseUntilValues()
            const buf = control.createBuffer(1)
            buf[0] = hwPin
            this.sendCommand(
                jacdac.JDPacket.from(jacdac.GPIOCmd.PinByHwPin, buf)
            )
        }

        /**
         * Run code when the digital pin state changes.
         */
        //% group="GPIO"
        //% weight=91
        onDigitalStateChanged(handler: () => void): void {
            this.onStateChanged(handler)
        }
    }

    //% fixedInstance whenUsed weight=1 block="gpio1"
    export const gpio1 = new GPIOClient("gpio1")
}
