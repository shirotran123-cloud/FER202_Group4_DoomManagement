import React, { createContext, useContext, useState } from "react"

export interface BookingSelection {
  building: string        // "b1" | "b2" | "b3"
  buildingLabel: string   // "Tòa A · Khu Nam"
  floor: number           // 1-5
  room: string            // "A205"
  compartment: string     // "B"
  compartmentTitle: string // "Balcony Wing"
  bedCode: string         // "A205-B-G03"
  bedSlot: string         // "G03"
  bedTier: "lower" | "upper"
  isConfirmed: boolean    // true after payment
}

interface BookingContextValue {
  booking: BookingSelection | null
  setBooking: (b: BookingSelection | null) => void
  confirmBooking: () => void
}

const defaultBooking: BookingSelection = {
  building: "b1",
  buildingLabel: "Tòa A · Khu Nam",
  floor: 2,
  room: "A205",
  compartment: "B",
  compartmentTitle: "Balcony Wing",
  bedCode: "A205-B-G03",
  bedSlot: "G03",
  bedTier: "lower",
  isConfirmed: true, // already confirmed from previous session
}

const BookingContext = createContext<BookingContextValue>({
  booking: defaultBooking,
  setBooking: () => {},
  confirmBooking: () => {},
})

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [booking, setBookingState] = useState<BookingSelection | null>(defaultBooking)

  const setBooking = (b: BookingSelection | null) => {
    setBookingState(b)
  }

  const confirmBooking = () => {
    setBookingState((prev) => prev ? { ...prev, isConfirmed: true } : prev)
  }

  return (
    <BookingContext.Provider value={{ booking, setBooking, confirmBooking }}>
      {children}
    </BookingContext.Provider>
  )
}

export const useBooking = () => useContext(BookingContext)
