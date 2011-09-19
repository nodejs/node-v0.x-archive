#ifndef _linklist_h_
#define _linklist_h_ 1

// SLINK - 单向链表
//
//typedef struct _SLINK{
//   _SLINK* _next;
//} SLINK,*PSLINK;


//初始化单向链表
//template< typename PSLINK >
//inline void SLINK_Initialize(PSLINK _head )
//{ (_head)->_next = NULL; }
#define SLINK_Initialize(_head)           ((_head)->_next = NULL)

//检测单向链表是否为空
//template< typename PSLINK >
//inline bool SLINK_IsEmpty(PSLINK _head )
//{ return ((_head)->_next == NULL);}
#define SLINK_IsEmpty(_head)              ((_head)->_next == NULL)

//取出单向链表第一个项目
//template< typename PSLINK ,typename PVALUE >
//inline PVALUE SLINK_Pop(PSLINK _head )
//{
//  PVALUE head_item = (_head)->_next;
//  (_head)->_next =  ((_head)->_next->_next);
//  return head_item;
//}
#define SLINK_Pop(_head)                  (_head)->_next;\
                                          (_head)->_next =  (_head)->_next->_next;

//将项目放入单向链表头部
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

//DLINK - 双向链表
//
//typedef struct _DLINK{
//   _DLINK* _prev;
//   _DLINK* _next;
//} DLINK,*PDLINK;

//初始化双向链表
//template< typename PDLINK >
//void DLINK_Initialize(PDLINK  _head)
//{
// (_head)->_next = (_head)->_prev = (_head);
//}
#define DLINK_Initialize(_head)            ((_head)->_next = (_head)->_prev = (_head))

//检测双向链表是否为空
//template< typename PDLINK >
//bool DLINK_IsEmpty(PDLINK)
//{
//  return ((_head)->_next == (_head));
//}
#define DLINK_IsEmpty(_head)               ((_head)->_next == (_head))

//将项目放入双向链表头部之后
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

//将项目放入双向链表头部之前
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
//从双向链表中删除当前项目
//template< typename PDLINK >
//inline void DLINK_Remove(PDLINK _dlink)
//{
//	(_dlink)->_prev->_next = (_dlink)->_next;
//    (_dlink)->_next->_prev = (_dlink)->_prev;
//}
#define DLINK_Remove(_dlink)               (_dlink)->_prev->_next = (_dlink)->_next;\
                                           (_dlink)->_next->_prev = (_dlink)->_prev
//从双向链表中取出当前项目的前一个
//template< typename PDLINK ,typename PVALUE >
//inline PVALUE DLINK_ExtructPrev(PDLINK _head )
//{
//	PVALUE v = (_head)->_prev;
//     DLINK_Remove((_head)->_prev);
//	 return v;
//}
#define DLINK_ExtructPrev(_head)           (_head)->_prev;\
                                          DLINK_Remove((_head)->_prev)
//从双向链表中取出当前项目的下一个
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
