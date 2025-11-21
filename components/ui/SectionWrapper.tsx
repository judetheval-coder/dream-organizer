"use client"
import React from 'react'

interface Props { id?: string; className?: string; children: React.ReactNode; }

export const SectionWrapper: React.FC<Props> = ({ id, className = '', children }) => (
  <section id={id} className={`py-24 ${className}`} style={{ scrollMarginTop: '90px' }}>
    {children}
  </section>
)

export default SectionWrapper
