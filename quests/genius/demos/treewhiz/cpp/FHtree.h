// File FHtree.h
// Template definitions for FHtrees, which are general trees
#ifndef FHTREE_H
#define FHTREE_H
#include <string>

// advanced prototype for the FHtreeNode to use to declare a friend
template <class Object>
class FHtree;

// ---------------------- FHtreeNode Prototype --------------------------
template <class Object>
class FHtreeNode
{
    friend class FHtree<Object>;
    
protected:
    FHtreeNode *firstChild, *sib, *prev;
    Object data;
    FHtreeNode *myRoot;  // needed to test for certain error
    
public:
    FHtreeNode( const Object & d = Object(),
               FHtreeNode *sb = NULL, FHtreeNode *chld = NULL, FHtreeNode *prv = NULL )
    : firstChild(chld), sib(sb), prev(prv), data(d), myRoot(NULL)
    { }
    Object GetData() const { return data; }
    
protected:
    // for use only by FHtree
    FHtreeNode( const Object & d,
               FHtreeNode *sb, FHtreeNode *chld, FHtreeNode *prv,
               FHtreeNode *root )
    : firstChild(chld), sib(sb), prev(prv), data(d), myRoot(root)
    { }
};
// ---------------------- FHtree Prototype --------------------------
template <class Object>
class FHtree
{
protected:
    int mSize;
    FHtreeNode<Object> *mRoot;
    
public:
    FHtree() { mSize = 0; mRoot = NULL; }
    FHtree(const FHtree &rhs) { mRoot = NULL; mSize = 0; *this = rhs; }
    virtual ~FHtree() { clear(); }
    bool empty() const { return (mSize == 0); }
    int size() const { return mSize; }
    void clear() { removeNode(mRoot); }
    const FHtree & operator=(const FHtree &rhs);
    
    FHtreeNode<Object> *addChild( FHtreeNode<Object> *treeNode, const Object &x );
    
    FHtreeNode<Object> *find(const Object &x) { return find(mRoot, x); }
    FHtreeNode<Object> *find(FHtreeNode<Object> *root,
                             const Object &x, int level = 0);
    
    bool remove(const Object &x) { return remove(mRoot, x); }
    bool remove(FHtreeNode<Object> *root, const Object &x);
    void removeNode(FHtreeNode<Object> *nodeToDelete);
    
    void display(FHtreeNode<Object> *treeNode = NULL, int level = 0) const;
    
    template <class Processor>
    void traverse(Processor func, FHtreeNode<Object> *treeNode = NULL) const;
    
protected:
    FHtreeNode<Object> *clone( FHtreeNode<Object> *root) const;
    void setMyRoots(FHtreeNode<Object> *treeNode);
    
    // New in V2
public:
    string to_json() const { return to_json(mRoot, 0); }
protected:
    string to_json(FHtreeNode<Object> *treeNode, int level) const;
};

// public interface methods of FHtree ------------------------
template <class Object>
FHtreeNode<Object>* FHtree<Object>::find(FHtreeNode<Object> *root,
                                         const Object &x, int level)
{
    FHtreeNode<Object> *retval;
    
    if (mSize == 0 || root == NULL)
        return NULL;
    
    if (root->data == x)
        return root;
    
    // otherwise, recurse.  don't process sibs if this was the original call
    if ( level > 0 && (retval = find(root->sib, x, level)))
        return retval;
    return find(root->firstChild, x, ++level);
}

template <class Object>
bool FHtree<Object>::remove(FHtreeNode<Object> *root, const Object &x)
{
    FHtreeNode<Object> *tn = NULL;
    
    if (mSize == 0 || root == NULL)
        return false;
    
    if ( (tn = find(root, x)) != NULL )
    {
        removeNode(tn);
        return true;
    }
    return false;
}

template <class Object>
const FHtree<Object> &FHtree<Object>::operator=
(const FHtree &rhs)
{
    if (&rhs != this)
    {
        clear();
        mRoot = clone(rhs.mRoot);
        mSize = rhs.mSize;
        setMyRoots(mRoot);
    }
    return *this;
}

template <class Object>
void FHtree<Object>::removeNode(FHtreeNode<Object> *nodeToDelete)
{
    if (nodeToDelete == NULL || mRoot == NULL)
        return;
    if (nodeToDelete->myRoot != mRoot)
        return;  // silent error, node does not belong to this tree
    
    // remove all the children of this node
    while (nodeToDelete->firstChild)
        removeNode(nodeToDelete->firstChild);
    
    if (nodeToDelete->prev == NULL)
        mRoot = NULL;  // last node in tree
    else if (nodeToDelete->prev->sib == nodeToDelete)
        nodeToDelete->prev->sib = nodeToDelete->sib; // adjust left sibling
    else
        nodeToDelete->prev->firstChild = nodeToDelete->sib;  // adjust parent
    
    // adjust the successor sib's prev pointer
    if (nodeToDelete->sib != NULL)
        nodeToDelete->sib->prev = nodeToDelete->prev;
    
    delete nodeToDelete;
    --mSize;
}

template <class Object>
FHtreeNode<Object> *FHtree<Object>::addChild(
                                             FHtreeNode<Object> *treeNode, const Object &x )
{
    // empty tree? - create a root node if user passes in NULL
    if (mSize == 0)
    {
        if (treeNode != NULL)
            return NULL; // silent error something's fishy.  treeNode can't right
        mRoot = new FHtreeNode<Object>(x, NULL, NULL, NULL);
        mRoot->myRoot = mRoot;
        mSize = 1;
        return mRoot;
    }
    if (treeNode == NULL)
        return NULL; // silent error inserting into a non_null tree with a null parent
    if (treeNode->myRoot != mRoot)
        return NULL;  // silent error, node does not belong to this tree
    
    // push this node into the head of the sibling list; adjust prev pointers
    FHtreeNode<Object> *newNode = new FHtreeNode<Object>(x,
                                                         treeNode->firstChild, NULL, treeNode, mRoot);  // sib, child, prev, root
    treeNode->firstChild = newNode;
    if (newNode->sib != NULL)
        newNode->sib->prev = newNode;
    ++mSize;
    return newNode;
}

template <class Object>
void FHtree<Object>::display(FHtreeNode<Object> *treeNode, int level) const
{
    FHtreeNode<Object> *child;
    
    // this will be static and so will be shared by all calls
    static string blankString = "                                    ";
    string indent;
    
    // stop runaway indentation/recursion
    if  (level > (int)blankString.length() - 1)
    {
        cout << blankString << " ... " << endl;
        return;
    }
    
    indent = blankString.substr(0, level);
    
    if (mRoot == NULL)
        return;
    if (treeNode == NULL)
    {
        display(mRoot);
        return;
    }
    
    cout << indent << treeNode->data  << endl;
    for (child = treeNode->firstChild; child != NULL; child = child->sib)
        display(child, level+1);
}

// New in V2
template <class Object>
string FHtree<Object>::to_json(FHtreeNode<Object> *treeNode, int level) const {
    static string blankString = "                                    ";
    string indent = blankString.substr(0, level);
    
    string result = indent + "{\n";
    
    result += indent + " \"name\": \"" + treeNode->data + "\"";
    result += treeNode->firstChild? ",\n" : "\n";
    
    // Omit serializing non-existing children.
    if (treeNode->firstChild) {
        result += indent + " \"children\": [\n";
        
        for (FHtreeNode<Object> *p = treeNode->firstChild; p != NULL; p = p->sib) {
            if (p != treeNode->firstChild) result += ",\n";
            result += to_json(p, level+2);
        }
        
        result += "\n" + indent + " ]\n";
    }
    
    result += indent + "}";
    return result;
}

template <class Object>
template <class Processor>
void FHtree<Object>::traverse(Processor func, FHtreeNode<Object> *treeNode) const
{
    FHtreeNode<Object> *child;
    
    if (mRoot == NULL)
        return;
    if (treeNode == NULL)
    {
        traverse(func, mRoot);
        return;
    }
    
    func(treeNode->data);
    
    for (child = treeNode->firstChild; child != NULL; child = child->sib)
        traverse(func, child);
}

// FHsearchTree protected method definitions -----------------------------
template <class Object>
FHtreeNode<Object> *FHtree<Object>::clone(
                                          FHtreeNode<Object> *root) const
{
    FHtreeNode<Object> *newNode;
    if (root == NULL)
        return NULL;
    
    // does not set myRoot which must be done by caller
    newNode = new FHtreeNode<Object>(
                                     root->data,
                                     clone(root->sib), clone(root->firstChild));
    if (newNode->sib)
        newNode->sib->prev = newNode;
    if (newNode->firstChild)
        newNode->firstChild->prev = newNode;
    return newNode;
}

template <class Object>
void FHtree<Object>::setMyRoots(FHtreeNode<Object> *treeNode)
{
    FHtreeNode<Object> *child;
    
    if (mRoot == NULL)
        return;
    
    treeNode->myRoot = mRoot;
    for (child = treeNode->firstChild; child != NULL; child = child->sib)
        setMyRoots(child);
}

#endif // FHTREE_H
