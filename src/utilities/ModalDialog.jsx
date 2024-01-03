import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'

export default function ModalDialog({ title, content, confirmText, onConfirm, loading, onOpen, onClose, isFullScreen, actionColor, disabledAction }) {

  return (
    <Dialog open={onOpen} onClose={onClose} fullScreen={isFullScreen} >
      <DialogTitle id="modal-dialog-title">
        {title}
        {/* floating action button for close */}
        <button className='btn btn-floating btn-sm float-end shadow-0'
          onClick={onClose} style={{ background: '#EEEEEE' }}>
          <i className="fas fa-close fa-lg"></i>
        </button>
      </DialogTitle>
      <DialogContent>
        {content}
      </DialogContent>
      <DialogActions className='pe-4 pb-3'>
        <Button onClick={onClose} className='bg-light'>Close</Button>
        {confirmText &&
          <Button onClick={onConfirm} variant="contained" color={actionColor} disabled={disabledAction}>
            {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : confirmText}
          </Button>
        }
      </DialogActions>
    </Dialog>
  )
}
