#ifndef _linklist_h_
#define _linklist_h_ 1

//
//typedef struct _SLINK{
//   _SLINK* _next;
//} SLINK,*PSLINK;


//template< typename PSLINK >
//inline void SLINK_Initialize(PSLINK _head )
//{ (_head)->_next = NULL; }
#define SLINK_Initialize(_head)           ((_head)->_next = NULL)

//template< typename PSLINK >
//inline bool SLINK_IsEmpty(PSLINK _head )
//{ return ((_head)->_next == NULL);}
#define SLINK_IsEmpty(_head)              ((_head)->_next == NULL)

//template< typename PSLINK ,typename PVALUE >
//inline PVALUE SLINK_Pop(PSLINK _head )
//{
//  PVALUE head_item = (_head)->_next;
//  (_head)->_next =  ((_head)->_next->_next);
//  return head_item;
//}
#define SLINK_Pop(_head)                  (_head)->_next;\
                                          (_head)->_next =  (_head)->_next->_next;

//template< typename PSLINK ,typename PVALUE >
//inline void SLINK_Push(PSLINK  _head, PVALUE  _link)
//{
// (_link)->_next =  (_head)->_next;
// (_head)->_next =  (_link);
//}
#define SLINK_Push(_head, _link)          (_link)->_next =  (_head)->_next; \
                                          (_head)->_next =  (_link)

///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////DOUBLE///LINK/////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

//
//typedef struct _DLINK{
//   _DLINK* _prev;
//   _DLINK* _next;
//} DLINK,*PDLINK;

//template< typename PDLINK >
//void DLINK_Initialize(PDLINK  _head)
//{
// (_head)->_next = (_head)->_prev = (_head);
//}
#define DLINK_Initialize(_head)            ((_head)->_next = (_head)->_prev = (_head))

//template< typename PDLINK >
//bool DLINK_IsEmpty(PDLINK)
//{
//  return ((_head)->_next == (_head));
//}
#define DLINK_IsEmpty(_head)               ((_head)->_next == (_head))

//template< typename PDLINK ,typename PVALUE >
//inline void DLINK_InsertNext(PDLINK _head,PVALUE _dlink)
//{
//	(_dlink)->_next = (_head)->_next;
//  (_dlink)->_prev = (_head);
//  (_head)->_next->_prev = (_dlink);
//  (_head)->_next = (_dlink);
//}
#define DLINK_InsertNext(_head,_dlink)     (_dlink)->_next = (_head)->_next;\
                                           (_dlink)->_prev = (_head);\
                                           (_head)->_next->_prev = (_dlink);\
                                           (_head)->_next = (_dlink)

//template< typename PDLINK ,typename PVALUE >
//inline void DLINK_InsertPrev(PDLINK _head,PVALUE _dlink )
//{
//    (_dlink)->_prev = (_head)->_prev;
//    (_dlink)->_next = (_head);
//    (_head)->_prev->_next = (_dlink);
//    (_head)->_prev = (_dlink);
//}
#define DLINK_InsertPrev(_head,_dlink)     (_dlink)->_prev = (_head)->_prev;\
                                           (_dlink)->_next = (_head);\
                                           (_head)->_prev->_next = (_dlink);\
                                           (_head)->_prev = (_dlink)
//template< typename PDLINK >
//inline void DLINK_Remove(PDLINK _dlink)
//{
//	(_dlink)->_prev->_next = (_dlink)->_next;
//    (_dlink)->_next->_prev = (_dlink)->_prev;
//}
#define DLINK_Remove(_dlink)               (_dlink)->_prev->_next = (_dlink)->_next;\
                                           (_dlink)->_next->_prev = (_dlink)->_prev
//template< typename PDLINK ,typename PVALUE >
//inline PVALUE DLINK_ExtructPrev(PDLINK _head )
//{
//	PVALUE v = (_head)->_prev;
//     DLINK_Remove((_head)->_prev);
//	 return v;
//}
#define DLINK_ExtructPrev(_head)           (_head)->_prev;\
                                          DLINK_Remove((_head)->_prev)
//template< typename PDLINK ,typename PVALUE >
//inline PVALUE DLINK_ExtructNext(PDLINK _head)
//{
//	PVALUE v = (_head)->_next;
//    DLINK_Remove((_head)->_next);
//	return v;
//}
#define DLINK_ExtructNext(_head)           (_head)->_next;\
                                           DLINK_Remove((_head)->_next)


#endif // _linklist_h_
