import "../assets/profile.scss"
import NavBar from "../components/navbar";
import anh from "../public/avt.png"
import doc from "../public/Sequence.pdf"

const Profile = () => {
    return (
        <div>
            <NavBar />
            <div className="profile-main-content">
                <div className="profile-container">
                    <div className="profile-profile-card">
                        <div className="profile-avatars">
                            <img className="profile-logo" src={anh} alt="Avatar" />
                        </div>
                        
                        <h1 className="profile-name">Đỗ Giang Bình</h1>
                        <p className="profile-title">Sinh viên PTIT</p>
                        
                        <div className="profile-info-grid">
                            <div className="profile-info-item">
                                <svg className="profile-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0V4a2 2 0 114 0v2"/>
                                </svg>
                                <span className="profile-info-label">MSV:</span>
                                <span className="profile-info-value">B22DCPT023</span>
                            </div>
                            
                            <div className="profile-info-item">
                                <svg className="profile-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                                <span className="profile-info-label">Email:</span>
                                <span className="profile-info-value">
                                    <a href="mailto:BinhDG.B22DCPT023@stu.ptit.edu.vn">BinhDG.B22DCPT023@stu.ptit.edu.vn</a>
                                </span>
                            </div>
                            
                            <div className="profile-info-item">
                                <svg className="profile-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                </svg>
                                <span className="profile-info-label">Phone:</span>
                                <span className="profile-info-value">0866206104</span>
                            </div>
                            
                        </div>
                        
                        <div className="profile-action-buttons">
                            {/* Nút PDF */}
                            <a href="https://docs.google.com/document/d/1wUwH5lwStkCWrd0XD00Ul78713kwVEqg/edit?usp=sharing&ouid=103114970132690207511&rtpof=true&sd=true" className="profile-btn profile-btn-primary" target="_blank" rel="noreferrer">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-1"/>
                                </svg>
                                Tải PDF    
                            </a>

                            

                            {/* Nút GitHub bổ sung mới */}
                            <a href="https://github.com/BinhDG/iot" className="profile-btn profile-btn-primary" target="_blank" rel="noreferrer">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.08.81 2.19 0 1.575-.015 2.85-.015 3.24 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                                </svg>
                                GitHub
                            </a>

                            {/* Nút Figma bổ sung mới */}
                            <a href="https://www.figma.com/design/xbiQCzOVzgzsPYbXTYDhp2/IOT?t=2uHMraUkpWkNHEP5-0" className="profile-btn profile-btn-primary" target="_blank" rel="noreferrer">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 38 38">
                                    <path d="M19 0a9.5 9.5 0 0 0-9.5 9.5 9.5 9.5 0 0 0 9.5 9.5V19a9.5 9.5 0 0 0 9.5-9.5A9.5 9.5 0 0 0 19 0zM9.5 19a9.5 9.5 0 0 0 0 19 9.5 9.5 0 0 0 9.5-9.5V19h-9.5zM28.5 19a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19z"/>
                                </svg>
                                Figma
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;