"use client";

import { ReactNode } from "react";

interface ModalProps {
	children: ReactNode;
	title?: string;
	show?: boolean;
	onClose?: () => void;
	className?: string;
}

export default function Modal({ children, title, show = true, onClose, className = "" }: ModalProps) {
	if (!show) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />

			<div className={`relative bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4 ${className}`}>
				<div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
					<h3 className="text-lg font-semibold">{title}</h3>
					{onClose && (
						<button onClick={onClose} aria-label="Close modal" className="p-2">
							<svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					)}
				</div>

				<div className="p-6">{children}</div>
			</div>
		</div>
	);
}
