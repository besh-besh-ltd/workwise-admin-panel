import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faLink } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { getRFQInvitedVendors } from '@/utils/services/rfq-management';

export interface InvitedVendorLink {
    vendor_id: number;
    name: string;
    email: string | null;
    mobile: string | null;
    // The items this vendor was sent (directly or through a product group).
    items: string[];
    organization_name: string | null;
    quote_status: 'Quoted' | 'Regretted' | 'Not quoted';
    link: string | null;
}

interface InvitedVendorsModalProps {
    show: boolean;
    onClose: () => void;
    rfqId: number | string;
    rfqNo?: number | string;
}

const STATUS_BADGE: Record<InvitedVendorLink['quote_status'], string> = {
    'Quoted': 'badge-success',
    'Regretted': 'badge-secondary',
    'Not quoted': 'badge-warning',
};

// A long item list is cut to the first few, with the rest one click away.
const ITEMS_SHOWN = 3;
const Items = ({ items }: { items: string[] }) => {
    const [all, setAll] = useState(false);
    if (!items?.length) return <span className="text-muted">—</span>;
    const shown = all ? items : items.slice(0, ITEMS_SHOWN);
    return (
        <span className="d-flex flex-wrap gap-1">
            {shown.map((name) => (
                <span key={name} className="badge badge-light border text-wrap text-left" title={name}>
                    {name}
                </span>
            ))}
            {items.length > ITEMS_SHOWN && (
                <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setAll((a) => !a)}>
                    {all ? 'Show less' : `+${items.length - ITEMS_SHOWN} more`}
                </button>
            )}
        </span>
    );
};

// The clipboard API, or — where it is unavailable — a hidden textarea.
const copyText = async (text: string): Promise<boolean> => {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // fall through to the textarea
    }
    try {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(area);
        return ok;
    } catch {
        return false;
    }
};

/**
 * Every vendor invited to this RFQ — name, contact, the items they were sent
 * and whether they have quoted — with a "Copy link" for the link their
 * invitation email carries, for a vendor who cannot find the email. The same
 * list as the buyer's RFQ page. The link is never shown: it opens the RFQ as
 * that vendor without a password, so it is only copied.
 */
const InvitedVendorsModal: React.FC<InvitedVendorsModalProps> = ({ show, onClose, rfqId, rfqNo }) => {
    const [vendors, setVendors] = useState<InvitedVendorLink[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Read when opened, so the list and quote statuses are current.
    useEffect(() => {
        if (!show) return;
        let active = true;
        setError(null);
        setVendors(null);
        getRFQInvitedVendors(rfqId)
            .then((res: any) => {
                if (active) setVendors(Array.isArray(res?.data) ? res.data : []);
            })
            .catch((err: any) => {
                if (!active) return;
                const message = err?.message?.response?.data?.message;
                setError(typeof message === 'string' && message ? message : 'The vendor list could not be loaded. Please try again.');
            });
        return () => {
            active = false;
        };
    }, [show, rfqId]);

    useEffect(() => () => {
        if (resetTimer.current) clearTimeout(resetTimer.current);
    }, []);

    const copy = async (vendor: InvitedVendorLink) => {
        if (!vendor.link) return;
        if (await copyText(vendor.link)) {
            setCopiedId(vendor.vendor_id);
            toast.success(`Link for ${vendor.organization_name || vendor.name} copied`);
            if (resetTimer.current) clearTimeout(resetTimer.current);
            resetTimer.current = setTimeout(() => setCopiedId(null), 2000);
        } else {
            toast.error("Couldn't copy the link. Please try again.");
        }
    };

    const subtitle = [
        rfqNo ? `RFQ #${rfqNo}` : null,
        vendors && vendors.length > 0 ? `${vendors.length} ${vendors.length === 1 ? 'vendor' : 'vendors'} invited` : null,
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <Modal
            show={show}
            onHide={onClose}
            size="xl"
            className="invited-vendors-modal-root"
            backdropClassName="invited-vendors-modal-backdrop"
            dialogClassName="invited-vendors-modal"
            centered
            scrollable
            aria-labelledby="invited-vendors-title"
        >
            <Modal.Header closeButton className="border-bottom">
                <div>
                    <Modal.Title id="invited-vendors-title" className="fs-5 fw-bold">
                        Invited Vendors
                    </Modal.Title>
                    {subtitle && <div className="text-muted small">{subtitle}</div>}
                </div>
            </Modal.Header>
            <Modal.Body>
                {error ? (
                    <p className="text-danger mb-0">{error}</p>
                ) : !vendors ? (
                    <div className="d-flex justify-content-center py-4">
                        <div className="spinner-border" role="status">
                            <span className="sr-only">Loading vendors…</span>
                        </div>
                    </div>
                ) : vendors.length === 0 ? (
                    <p className="text-muted mb-0">No vendors have been invited to this RFQ.</p>
                ) : (
                    <>
                        <div className="alert alert-warning py-2 small">
                            Each link opens this RFQ as that vendor, without a password. Share it only with that vendor.
                        </div>
                        <div className="table-responsive">
                            <table className="table table-sm table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Vendor</th>
                                        <th>Contact</th>
                                        <th>Items</th>
                                        <th>Quote</th>
                                        <th className="text-right">Invitation link</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendors.map((vendor) => {
                                        const copied = copiedId === vendor.vendor_id;
                                        const company =
                                            vendor.organization_name && vendor.organization_name !== vendor.name
                                                ? vendor.organization_name
                                                : null;
                                        const who = vendor.organization_name || vendor.name;
                                        return (
                                            <tr key={vendor.vendor_id}>
                                                <td>
                                                    <div className="fw-bold">{vendor.name}</div>
                                                    {company && <div className="text-muted small">{company}</div>}
                                                </td>
                                                <td className="invited-vendors-contact">
                                                    <div>{vendor.email || '—'}</div>
                                                    <div className="text-muted small">{vendor.mobile || '—'}</div>
                                                </td>
                                                <td style={{ maxWidth: 320 }}>
                                                    <Items items={vendor.items || []} />
                                                </td>
                                                <td>
                                                    <span className={`badge ${STATUS_BADGE[vendor.quote_status] || 'badge-light'}`}>
                                                        {vendor.quote_status}
                                                    </span>
                                                </td>
                                                <td className="text-right text-nowrap">
                                                    <button
                                                        type="button"
                                                        className={`btn btn-sm ${copied ? 'btn-success' : 'btn-outline-primary'}`}
                                                        onClick={() => copy(vendor)}
                                                        disabled={!vendor.link}
                                                        title={vendor.link ? undefined : 'No invitation link has been sent to this vendor for this RFQ'}
                                                        aria-label={vendor.link ? `Copy invitation link for ${who}` : `No invitation link for ${who}`}
                                                        id={`copy_vendor_link_${vendor.vendor_id}-invited_vendors-admin_rfq_details`}
                                                    >
                                                        <FontAwesomeIcon icon={copied ? faCheck : faLink} className="me-1" />
                                                        {vendor.link ? (copied ? 'Copied' : 'Copy link') : 'No link'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </Modal.Body>

            {/* The dialog renders outside this component, so it is styled globally, by its own classes.
                The admin sidebar sits at z-index 1100, above Bootstrap's modal (1050) and its
                backdrop (1040); this modal and its backdrop go above it, as a modal should. */}
            <style jsx global>{`
                .invited-vendors-modal-backdrop {
                    z-index: 1110;
                }
                .invited-vendors-modal-root {
                    z-index: 1120;
                }
                .invited-vendors-modal {
                    max-width: min(1100px, 95vw);
                }
                .invited-vendors-modal .invited-vendors-contact {
                    min-width: 220px;
                    overflow-wrap: anywhere;
                }
            `}</style>
        </Modal>
    );
};

export default InvitedVendorsModal;
