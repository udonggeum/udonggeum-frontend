import { Link } from 'react-router-dom';

/**
 * Footer Component
 *
 * Site footer with three columns: company info, customer support, and legal notices.
 * Includes copyright notice at the bottom.
 */
export default function Footer() {
  return (
    <footer className="bg-base-200 text-base-content">
      {/* Main Footer Content */}
      <div className="footer p-10 container mx-auto">
        {/* Company Info Column */}
        <nav>
          <h3 className="footer-title">회사정보</h3>
          <Link to="/about" className="link link-hover">
            회사소개
          </Link>
          <Link to="/stores" className="link link-hover">
            매장안내
          </Link>
        </nav>

        {/* Customer Support Column */}
        <nav>
          <h3 className="footer-title">고객지원</h3>
          <Link to="/faq" className="link link-hover">
            FAQ
          </Link>
          <Link to="/shipping" className="link link-hover">
            배송 안내
          </Link>
          <Link to="/returns" className="link link-hover">
            반품/교환
          </Link>
          <Link to="/order-tracking" className="link link-hover">
            주문 조회
          </Link>
        </nav>

        {/* Legal Notices Column */}
        <nav>
          <h3 className="footer-title">법적고지</h3>
          <Link to="/terms" className="link link-hover">
            이용약관
          </Link>
          <Link to="/privacy" className="link link-hover">
            개인정보처리방침
          </Link>
          <Link to="/cookies" className="link link-hover">
            쿠키 정책
          </Link>
        </nav>

        {/* Contact & Social Media (Optional 4th column) */}
        <nav>
          <h3 className="footer-title">문의하기</h3>
          <div className="flex flex-col gap-2">
            <p className="text-sm">
              <span className="font-semibold">고객센터:</span> 1588-0000
            </p>
            <p className="text-sm">
              <span className="font-semibold">이메일:</span> support@udonggeum.kr
            </p>
            <p className="text-sm">
              <span className="font-semibold">운영시간:</span> 평일 09:00 - 18:00
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-square btn-sm"
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-square btn-sm"
              aria-label="Facebook"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
          </div>
        </nav>
      </div>

      {/* Copyright Section */}
      <div className="footer footer-center p-4 bg-base-300 text-base-content border-t border-base-300">
        <aside>
          <p className="text-sm">
            Copyright © 2025 우리동네금은방. All rights reserved.
          </p>
        </aside>
      </div>
    </footer>
  );
}
